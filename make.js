/* global target, cd, mkdir, cat, ls, find, rm, exec */

require('shelljs/make');

var path = require('path'),
    jade = require('jade'),
    sass = require('node-sass'),
    chokidar = require('chokidar'),
    server = require('live-server');

var dontServeFiles = ['node_modules', 'make.js', 'CNAME', 'package.json', 'src', 'typings'];
var dontCleanFiles = ['node_modules', 'make.js', 'CNAME', 'package.json', 'src', 'typings', 'favicon.ico', 'assets', 'data', 'google05bb826a3be4190b.html']

function merge(obj1, obj2) {
    var result = {};
    for(var key in obj1) result[key] = obj1[key];
    for(var key in obj2) result[key] = obj2[key];
    return result;
}

target.all = function() {
    console.log('target all');
    
    target.html();
    target.css();
    target.config();
};

target.clean = function() {
    console.log('target clean');
    
    ls('./').filter(function (file) {
        return dontCleanFiles.indexOf(file) === -1;
    }).forEach(function (file) {
        rm('-rf', file);
    });
};

var compileHtml = function(file) {
    var processFile = function(file) {
        var newFilename = path.basename(file, '.jade') + '.html';
        var newPath = path.dirname(file);
        
        var locals = JSON.parse(cat('../data/' + path.basename(file, '.jade') + '.json') || '{}')
        
        mkdir('-p', path.join(__dirname, newPath));
        jade.renderFile(file, merge(locals, { filename: file, pretty: false })).to(path.join(__dirname, newPath, newFilename));
    };
    
    if (file === undefined) {
        cd(__dirname + '/src');
        
        find('./').filter(function (file) {
            return file.match(/^[^_].*\.jade$/i);
        }).forEach(processFile);
    } else {
        processFile(file);
    }
};

target.html = function() {
    console.log('target html');
    compileHtml();    
};

var compileCSS = function(file) {
    var processFile = function(file) {
        var newFilename = path.basename(file, '.scss') + ".css";
        var newPath = path.dirname(file);
        
        mkdir('-p', path.join(__dirname, newPath));
        sass.renderSync({ file: __dirname + '/src/' + file, outputStyle: 'compressed' }).css.toString().to(path.join(__dirname, newPath, newFilename));
    };
    
    if (file === undefined) {
        cd(__dirname + '/src');
    
        find('./').filter(function (file) {
            return file.match(/^[^_].*\.scss$/i);
        }).forEach(processFile);
    } else {
        processFile(file);
    }
}; 

target.css = function() {
    console.log('target css');
    compileCSS();    
};

target.config = function() {
    console.log('target config');
    
    cd(__dirname);
    ('exclude: [' + dontServeFiles.join(', ') + ']').to('_config.yml');
};

target.watch = function() {
    console.log('target watch');
    
    target.html();
    target.css();
     
    chokidar.watch(
        path.resolve(__dirname, 'src/**/*.jade'), 
        { ignoreInitial: true }
    ).on('all', (event, path) => { 
        try {
            compileHtml()
        } catch(e) {
            console.error('Error during html compile: ', e);
        }
    });
    
    chokidar.watch(
        path.resolve(__dirname, 'src/**/*.scss'), 
        { ignoreInitial: true }
    ).on('all', (event, path) => { 
        try {
            compileCSS()
        } catch(e) {
            console.error('Error during css compile: ', e);
        }
    });
    
    server.start({
        root: __dirname,
        ignore: ['src'],
        wait: 200
    });
};