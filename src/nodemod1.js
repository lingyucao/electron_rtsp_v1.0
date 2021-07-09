// 'use strict';
var net = require('net');
var express = require('express');
var app = express();
var Stream = require('./node-rtsp-stream/index.js');
var streams = {}; //异步对列长度6
var streams_id = 0;//增量不重复

//流对应的服务端口队列,需要的端口号10000-10006
var listdlport = [10000,10001,10002,10003,10004,10005,10006,10007,10008,10009];//

//两个测试用的数据
//[{ url: "rtmp://58.200.131.2:1935/livetv/dftv" }, { url: "rtmp://58.200.131.2:1935/livetv/hunantv" }];

app.get('/api/getport', function (req, res, next) {
	createstream(req, res);
});

//http服务开启
var server = app.listen(9997, '0.0.0.0', function () {
	var host = server.address().address;
	var port = server.address().port;
});

//定时清理无用服务
clearport();

// 创建流
function createstream(req, res) {
	
	var arr = Object.keys(streams); 
	//限支持10路相机
	if(arr.length==10){
		var _data = { port: 0,txt:"超出支持个数" }
		res.type('application/json');
		res.jsonp(_data);
		return;
	}
	//如果存在url，直接返回
	for(n in streams){		
		if(req.query.url==streams[n].streamUrl){
			var _data = { port: streams[n].wsPort }
			res.type('application/json');
			res.jsonp(_data);
			return;
		}
	}
	//不存在，流队列追加一个流对象
		if(arr.length==0){
			madeobj(req.query.url,10000);return;
		}else{
		
			
			for(var m=0;m<listdlport.length;m++){
			
				var arr_port=[]
				for(var n in streams){//端口没有占用就直接返回创建
					arr_port.push(streams[n].wsPort)
				}				
				if(!arr_port.includes(listdlport[m])) {
				   madeobj(req.query.url,listdlport[m])
				   return;
				}
				
			}
			
		}
		
		
		
	
function  madeobj(url,port){
	streams[streams_id] = new Stream({
		name: 'sockets'+streams_id,
		streamUrl: url,
		wsPort: port,
		ffmpegOptions: { // 选项ffmpeg标志rtmp://58.200.131.2:1935/livetv/dftv
			'-stats': '', // 没有必要值的选项使用空字符串
			'-r': 30, // 具有必需值的选项指定键后面的值<br>　　　　'-s':'1920*1080'
			// '-s':'800*600',//最快
			//'-s':'1920*1080',//标清
			'-s':'3840x1920',//高清
		}
	});
		
	
	var _data = { port: port };
	res.type('application/json');
	res.jsonp(_data);
	streams_id++;
}
		
		
		

}

//定时清理无用端口,3次都不活动的对象清除
function clearport() { 
	var x=1;
	var arr_a=[];
	var arr_b=[];
	var arr_c=[];
	
	setInterval(function () {
		
		if(x>3){x=1;arr_a=[];arr_b=[];arr_c=[]}
		var arr = Object.keys(streams); 

		for(var n in streams){
			
			if(x==1&&streams[n].wsServer._server){
				if (streams[n].wsServer._server._connections == 0) {
					arr_a.push(n)
				}
			}
			
			if(x==2&&streams[n].wsServer._server){
				if (streams[n].wsServer._server._connections == 0) {
					arr_b.push(n)
				}
			}
			
			if(x==3&&streams[n].wsServer._server){
				if (streams[n].wsServer._server._connections == 0) {
					arr_c.push(n)
				}
			}
		}

		for(var n in streams){
			
			if(streams[n].wsServer._server){
				if (streams[n].wsServer._server._connections == 0 && arr_a.includes(n) && arr_b.includes(n)&& arr_c.includes(n)) {
					streams[n].stop();
					delete streams[n]
				}
			}
		}
		
		x++

	
	}, 2000);
}




