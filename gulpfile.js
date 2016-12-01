var gulp = require("gulp");
var path = require("path");
var connect = require('gulp-connect');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');

// scss
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require('gulp-autoprefixer');
var concat = require("gulp-concat");
var cssnano = require("gulp-cssnano")

// js
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

// templates
var fs = require('fs');
var handlebars = require('gulp-compile-handlebars');
var htmlreplace = require('gulp-html-replace');

var PATHS = {
  'input': path.join(__dirname, 'src'),
  'out': {
    'dev': path.join(__dirname, 'public', '.dev'),
    'prod': path.join(__dirname, 'public', 'dist')
  }
}

var FILENAMES = {
  'css': {
    'dev': 'styles.css',
    'prod': 'styles.min.css'
  },
  'js': {
    'dev': 'bundle.js',
    'prod': 'bundle.min.js'
  }
}

var ENV = undefined;
if(gutil.env.env === undefined || gutil.env.env === 'dev'){
  ENV = 'dev';
} else if(gutil.env.env === 'prod') {
  ENV = 'prod';
} else {
  gutil.log("Unknown env flag set:", gutil.env.env, "Exiting. 👋");
  process.exit();
}

var RUNTIME_CONFIG = {
  isProd: ENV === 'prod' ? true : false,
  isDev: ENV === 'dev' ? true : false,
  filenames: {
    css: FILENAMES.css[ENV],
    js: FILENAMES.js[ENV],
  },
  paths: {
    out: PATHS.out[ENV]
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
gulp.task('scss', function(){
  gulp.src(path.join(PATHS.input, 'scss', '*.scss'))
    // source maps
    .pipe(gulpif( RUNTIME_CONFIG.isDev, sourcemaps.init() ))

    // compile scss
    .pipe(sass().on('error', handleErrors))

    // rename
    .pipe(concat(RUNTIME_CONFIG.filenames.css))

    // close sourcemap
    .pipe(gulpif( RUNTIME_CONFIG.isDev, sourcemaps.write('.') ))

    // prod functions
    .pipe(gulpif( RUNTIME_CONFIG.isProd, autoprefixer({browsers: ['last 2 versions']}) ))
    .pipe(gulpif( RUNTIME_CONFIG.isProd, cssnano() ))

    // output
    .pipe(gulp.dest(RUNTIME_CONFIG.paths.out))

    // livereload
    .pipe(gulpif( RUNTIME_CONFIG.isDev, connect.reload() ))
});

/**
 * Bundles js
 */
gulp.task('bundleJs', function(){
  // bundle w/ browserify
  browserify({
  	entries: [
      path.join(PATHS.input, 'js', 'main.js')
    ],
  	debug: RUNTIME_CONFIG.isDev
	})
  .on('error', handleErrors)
  .bundle()
  .on('error', handleErrors)

  //convert to stream
  .pipe(source(RUNTIME_CONFIG.filenames.js))

  // prod functions
  .pipe(gulpif( RUNTIME_CONFIG.isProd, streamify(uglify()) ))

  // output
  .pipe(gulp.dest(RUNTIME_CONFIG.paths.out))

  // livereload
  .pipe(gulpif( RUNTIME_CONFIG.isDev, connect.reload() ))
});

/**
 * Compile case studies in static HTML files
 */
var hbs_options = {
 // array of filepaths for partials
 batch: path.join(PATHS.input, 'views', 'partials')
}

gulp.task('compileCaseStudies', function(){

  // get raw template
  var template = path.join(PATHS.input, 'views', 'case-study.handlebars');

  // array of filenames for case studies
  var case_filenames = fs.readdirSync(path.join(PATHS.input, 'case-study-data'));

  // iterate over file names
  case_filenames.forEach(function(filename){

    // get raw JSON data
    var data = JSON.parse(fs.readFileSync(path.join(PATHS.input, 'case-study-data', filename)));
    // get name without json extension
    var name = filename.replace(/.json$/, '');

    gulp.src(template)
      // compile handlebars
      .pipe(handlebars(data, hbs_options))

      // inject prod css/js asset paths
      .pipe(gulpif( RUNTIME_CONFIG.isProd, htmlreplace({
          css: '/'+RUNTIME_CONFIG.filenames.css,
          js: '/'+RUNTIME_CONFIG.filenames.js
        }, {
          keepBlockTags: false
        })
      ))

      // rename
      .pipe(concat("case-study_" + name + '.html'))

      // output
      .pipe(gulp.dest(RUNTIME_CONFIG.paths.out))

      // livereload
      .pipe(gulpif( RUNTIME_CONFIG.isDev, connect.reload() ))
  });

});

/**
 * Compile index into a static HTML file
 */
gulp.task('compileIndex', function(){
  gulp.src(path.join(PATHS.input, 'views', 'index.handlebars'))

    // compile handlebars
    .pipe(handlebars({}, hbs_options))

    // inject prod css/js asset paths
    .pipe(gulpif( RUNTIME_CONFIG.isProd, htmlreplace({
        css: '/'+RUNTIME_CONFIG.filenames.css,
        js: '/'+RUNTIME_CONFIG.filenames.js
      }, {
        keepBlockTags: false
      })
    ))

    // rename
    .pipe(concat("index.html"))

    // output
    .pipe(gulp.dest(RUNTIME_CONFIG.paths.out))

    // livere
    .pipe(gulpif( RUNTIME_CONFIG.isDev, connect.reload() ))
});

/**
 * Watch files, run task when modified.
 */
gulp.task("devWatch", function(){

  gulp.watch([
    path.join(PATHS.input, 'scss', '*.scss'),
    path.join(PATHS.input, 'scss', '**', '*.scss')
  ], function(){
    gulp.start('scss');
  });

  gulp.watch([
    path.join(PATHS.input, 'js', '*.js'),
    path.join(PATHS.input, 'js', 'components', '*.js'),
  ], function(){
    gulp.start('bundleJs');
  });

  gulp.watch([
    path.join(PATHS.input, 'views', 'case-study.handlebars'),
    path.join(PATHS.input, 'case-study-data', '*.json')
  ], function(){
    gulp.start('compileCaseStudies')
  })

  gulp.watch([
    path.join(PATHS.input, 'views', 'index.handlebars'),
    path.join(PATHS.input, 'views', 'partials', '*.handlebars')
  ], function(){
    gulp.start('compileIndex')
  })

});

/**
 * Run development web server
 */
 gulp.task('devConnect', ['scss', 'bundleJs', 'devWatch'], function() {
  connect.server({
    root: [path.join('public', '.dev'), path.join('public', 'assets')],
    livereload: true
  });
 });

/**
 * Default task run w/ `gulp`
 */
gulp.task('default', ['devConnect']);

/**
 * Prod gulp tasks
 */
gulp.task('prodBuild', ['scss', 'bundleJs', 'compileIndex', 'compileCaseStudies'], function(){
  setTimeout(function(){
    gutil.log(gutil.colors.green("prodBuild complete"), "|", "env:", ENV, "|", "output:", RUNTIME_CONFIG.paths.out );
    gutil.log("Run", gutil.colors.green("`npm run serve-prod`"), "to test on prod server.");
  }, 10 );
})
