//'use strict';


const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


app.on('ready', function(){
	 require('./nodemod1.js');

});





