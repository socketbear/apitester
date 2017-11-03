/* eslint-disable */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonServer = require('json-server');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

// Reverse Proxy를 위함.
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();

// region jgapi로 들어온 요청은 json server로 활용한다.
// api tester 전용 db 및 서버
var jsonServerRouter = jsonServer.router('db.json')

app.use('/jgapi', jsonServerRouter);
jsonServerRouter.render = (req, res) => {
  var dataLength = res.locals.data.length

  var resObj = {
    data: res.locals.data,
    status: 200,
    dataCount: dataLength,
    dt: Date.now()
  }

  res.send(resObj)
}
// endregion

// region Reverse Proxy 서버 설정 전용 API 셋
// 변경하여, 다른 서버를 프록시로 접근할 수 있음.
var settingReverseProxyServerInfo = {
  url:'http://localhost:3001'
};

apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
  if(req.body) {
    var contentType = req.header('Content-Type');

    if(contentType != null && contentType != undefined){
        if(contentType.indexOf('application/json') != -1){
            var bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type','application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    console.log('contentType >>>',proxyReq.getHeader('Content-Type'));
  }
});

apiProxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

app.all('/rfapi/*', function(req, res){
  console.log('connection reverse proxy - '+settingReverseProxyServerInfo.url+' server');
  apiProxy.web(req, res, {target: settingReverseProxyServerInfo.url, changeOrigin:true});
});

app.get('/reverseEnv',function(req,res){
  res.send(settingReverseProxyServerInfo);
});

app.post('/reverseEnv',function(req,res){
  var resObj = {
    code:'000'
  };
  var url = req.body.url;
  if(url){
    settingReverseProxyServerInfo.url=url;
  }else{
    resObj.code = '001';
  }

  res.send(resObj);
});
// endregion

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
