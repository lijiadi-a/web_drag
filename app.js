//加载Express模块
const express = require('express');

//加载FS(FileSystem)模块
const fs = require('fs');

//创建Express实例
const server = express();

//静态资源托管
server.use(express.static('public'));

//加载Multer模块
const multer = require('multer');

//加载UUID模块
const uuid = require('uuid');

//加载MySQL模块
const mysql = require('mysql');

//创建Multer对象实例,其中dest(destination,译为目标)参数
//用于指定上传文件的目录
const upload = multer({dest:'upload'});

//单文件上传时的界面接口
server.get('/single',(req,res)=>{
  let data = fs.readFileSync('./01_single.html',{encoding:"utf8"});
  res.send(data);
});


//接收单文件上传时的接口
server.post('/single',upload.single('avatar'),(req,res)=>{
  console.log(req.file);
  res.send("OK");
});


//多文件上传时的界面接口
server.get('/multiple',(req,res)=>{
  let data = fs.readFileSync('./02_multiple.html',{encoding:"utf8"});
  res.send(data);
});

//接收多文件上传时的接口
server.post('/multiple',upload.array('avatar'),(req,res)=>{
  console.log(req.files);
  res.send("OK");
});

//自定义规则的多文件上传时的界面接口
server.get('/custom',(req,res)=>{
  let data = fs.readFileSync('./03_custom.html',{encoding:"utf8"});
  res.send(data);
});

//定制Multer的存储规则
let storage = multer.diskStorage({
  destination:function(req,file,cb){
    //日期对象
    let now = new Date();
    //年份
    let fullYear = now.getFullYear();
    //月份
    let month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    //日期
    let day = now.getDate();
    day = day < 10 ? '0' + day : day;
    //目录名称
    let path = 'upload/' + fullYear  + '-' + month + '-' + day;
    
    //判断目录是否存在,如果不存在,则自动创建之
    if(!fs.existsSync(path)){
      fs.mkdirSync(path,(err)=>{
        throw err;
      });
    }
    cb(null,path);
  },
  filename:function(req,file,cb){
      //获取上传文件的原始名称
      let originalname = file.originalname;
      //获取文件的扩展名
      let extension = originalname.substr(originalname.lastIndexOf('.') + 1).toLowerCase();
      //生成唯一的主文件名，基于时间戳的UUID
      let mainame = uuid.v1();
      //将主文件名与扩展名拼接在一起==>新的文件名称
      let filename = mainame + '.' + extension;
      //调用回调函数
      cb(null,filename);

  }
});

//根据自定义存储规则来创建Multer对象实例
const upload2 = multer({storage:storage});

//接收自定义规则多文件上传时的接口
server.post('/custom',upload2.array('avatar'),(req,res)=>{
  console.log(req.files);
  res.send("OK");
});


//自定义规则的多文件上传时的界面接口
server.get('/drag',(req,res)=>{
  let data = fs.readFileSync('./04_drag.html',{encoding:"utf8"});
  res.send(data);
});


//创建MySQL连接池
const pool = mysql.createPool({
  host:'127.0.0.1',
  port:3306,
  user:'root',
  password:'',
  database:'web2004',
  charset:'utf8',
  connectionLimit:20
});

//接收自定义规则多文件上传时的接口
server.post('/drag',upload2.array('face'),(req,res)=>{
  for(var n = 0; n < req.files.length;n++){
    let file = req.files[n];
    let path = file.path.replace(/\\\\/g,'/');
    path = path.substr(7);
    console.log(path);
  }
  res.send("OK");
});

//指定Express实例监听的端口
server.listen(3000);