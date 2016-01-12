/* global target, cd, mkdir, cat, ls, find, rm, exec */

require('shelljs/make');

var path = require('path'),
    ejs = require('ejs'),
    less = require('less');

var ignoredFiles = ['node_modules', 'make.js', 'CNAME', 'package.json', 'src', 'typings'];

target.all = function() {
    target.html();
    target.css();
    target.config();
};

target.clean = function() {
    ls('./').filter(function (file) {
        return ignoredFiles.indexOf(file) === -1;
    }).forEach(function (file) {
        rm('-rf', file);
    });
};

target.html = function() {
    cd(__dirname + '/src');
    
    find('./').filter(function (file) {
        return file.match(/^[^_].*\.ejs$/i);
    }).forEach(function (file) {
        var newFilename = path.basename(file, '.ejs') + ".html";
        var newPath = path.dirname(file);
        
        mkdir('-p', path.join(__dirname, newPath));
        ejs.render(cat(file), {}, { filename: file }).to(path.join(__dirname, newPath, newFilename));
    });
};

target.css = function() {
    cd(__dirname + '/src');
    
    find('./').filter(function (file) {
        return file.match(/^[^_].*\.less$/i);
    }).forEach(function (file) {
        var newFilename = path.basename(file, '.less') + ".css";
        var newPath = path.dirname(file);
        
        mkdir('-p', path.join(__dirname, newPath));
        
        cd(__dirname + '/node_modules/.bin');
        exec('lessc ' + __dirname + '/src/main.less', {silent:true}).output.to(path.join(__dirname, newPath, newFilename));
    });
};

target.config = function() {
    cd(__dirname);
    
    ('exclude: [' + ignoredFiles.join(', ') + ']').to('_config.yml');
};