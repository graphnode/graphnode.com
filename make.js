/* global target, cd, mkdir, cat, ls, find, rm, exec */

require('shelljs/make');

var path = require('path'),
    jade = require('jade'),
    sass = require('node-sass'),
    chokidar = require('chokidar'),
    server = require('live-server');

var ignoredFiles = ['node_modules', 'make.js', 'CNAME', 'package.json', 'src', 'typings'];

target.all = function() {
    console.log('target all');
    
    target.html();
    target.css();
    target.config();
};

target.clean = function() {
    console.log('target clean');
    
    ls('./').filter(function (file) {
        return ignoredFiles.indexOf(file) === -1 || file === 'assets';
    }).forEach(function (file) {
        rm('-rf', file);
    });
};

var compileHtml = function(file) {
    var processFile = function(file) {
        var newFilename = path.basename(file, '.jade') + ".html";
        var newPath = path.dirname(file);
        
        mkdir('-p', path.join(__dirname, newPath));
        jade.renderFile(file, { filename: file, pretty: '\t' }).to(path.join(__dirname, newPath, newFilename));
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
        sass.renderSync({ file: __dirname + '/src/' + file, outputStyle: 'expanded' }).css.toString().to(path.join(__dirname, newPath, newFilename));
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
    ('exclude: [' + ignoredFiles.join(', ') + ']').to('_config.yml');
};

target.watch = function() {
    console.log('target watch');
    
    target.html();
    target.css();
     
    chokidar.watch(
        path.resolve(__dirname, 'src/**/*.jade'), 
        { ignoreInitial: true }
    ).on('all', (event, path) => compileHtml());
    
    chokidar.watch(
        path.resolve(__dirname, 'src/**/*.scss'), 
        { ignoreInitial: true }
    ).on('all', (event, path) => compileCSS());
    
    server.start({
        root: __dirname,
        ignore: ['src'],
        wait: 200
    });
};