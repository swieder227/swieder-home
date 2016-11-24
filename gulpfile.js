var gulp = require("gulp");
var path = require("path");
var connect = require('gulp-connect');
var notify = require('gulp-notify');

// scss
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require('gulp-autoprefixer');
var concat = require("gulp-concat");

// js
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');

// templates
var fs = require('fs');
var handlebars = require('gulp-compile-handlebars');

var PATHS = {
  input: path.join(__dirname, 'src'),
  dev_out: path.join(__dirname, 'public', '.dev'),
  prod_out: path.join(__dirname, 'public', 'dist')
}

var FILENAMES = {
  'css': {
    'dev': 'styles.css'
  },
  'js': {
    'dev': 'bundle.js'
  }
}

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>',
    sound: false
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

/**
 * Compiles sass
 */
gulp.task('devScss', function(){
  gulp.src(path.join(PATHS.input, 'scss', '*.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', handleErrors))
    .pipe(concat(FILENAMES.css.dev))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dev_out))
    .pipe(connect.reload())
});

/**
 * Bundles js
 */
gulp.task('devJs', function(){
  browserify({
  	entries: [
      path.join(PATHS.input, 'js', 'main.js')
    ],
  	debug: true
	})
  .on('error', handleErrors)
  .bundle()
  .on('error', handleErrors)
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(PATHS.dev_out))
  .pipe(connect.reload())

});

/**
 * Compile case studies in static HTML files
 */
gulp.task('compileCaseStudies', function(){

  var template = path.join(PATHS.input, 'views', 'case-study.handlebars');

  // array of files within dir
  var case_filenames = fs.readdirSync(path.join(PATHS.input, 'case-study-data'));

  case_filenames.forEach(function(filename){

    var data = require(path.join(PATHS.input, 'case-study-data', filename));
    var name = filename.replace(/.json$/, '');

    gulp.src(template)
      .pipe(handlebars(data))
      .pipe(concat("case-study_" + name + '.html'))
      .pipe(gulp.dest(PATHS.dev_out))
      .pipe(connect.reload());
  });

});

/**
 * Compile index into a static HTML file
 */
gulp.task('compileIndex', function(){
  gulp.src(path.join(PATHS.input, 'views', 'index.handlebars'))
    .pipe(handlebars())
    .pipe(concat("index.html"))
    .pipe(gulp.dest(PATHS.dev_out))
    .pipe(connect.reload());
});

/**
 * Watch files, run task when modified.
 */
gulp.task("devWatch", function(){

  gulp.watch([
    path.join(PATHS.input, 'scss', '*.scss'),
    path.join(PATHS.input, 'scss', '**', '*.scss')
  ], function(){
    gulp.start('devScss');
  });

  gulp.watch([
    path.join(PATHS.input, 'js', '*.js'),
    path.join(PATHS.input, 'js', 'components', '*.js'),
  ], function(){
    gulp.start('devJs');
  });

  gulp.watch([
    path.join(PATHS.input, 'views', 'case-study.handlebars'),
    path.join(PATHS.input, 'case-study-data', '*.json')
  ], function(){
    gulp.start('compileCaseStudies')
  })

  gulp.watch([
    path.join(PATHS.input, 'views', 'index.handlebars')
  ], function(){
    gulp.start('compileIndex')
  })

});

/**
 * Run development web server
 */
 gulp.task('devConnect', ['devScss', 'devJs', 'devWatch'], function() {
  connect.server({
    root: [path.join('public', '.dev'), path.join('public', 'assets')],
    livereload: true
  });
 });

/**
 * Default task run w/ `gulp`
 */
gulp.task('default', ['devConnect']);
