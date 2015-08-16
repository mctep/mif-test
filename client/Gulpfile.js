var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var config = require('../server/config');
var resolve = require('resolve');
var watchify = require('watchify');
var minifyCss = require('gulp-minify-css');
var minifyJs = require('gulp-uglify');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var templateCache = require('gulp-angular-templatecache');

// ==============

var STATIC_LESS = path.resolve(__dirname, 'less');
var STATIC_DIR = path.resolve(__dirname, 'public');

var LESS_DIST_FILES = ['index.less'];
var TEMAPLTES_DIST_FILES = ['directives/**.html'];

var VENDOR_LIBS = [
	'lodash',
	'jquery',
	'angular',
	'angular-sanitize'
];

var VENDOR_DIST_FILE = 'vendors.js';
var BROWSERIFY_PATHS = [
	path.resolve(__dirname, '../node_modules'),
	path.resolve(__dirname, '.')
];

var CLIENT_SRC = path.resolve(__dirname, 'index.js');
var CLIENT_DIST = 'index.js';

// ==============

gulp.task('default', ['watch']);
gulp.task('compile', ['vendors', 'less', 'scripts']);
// gulp.task('build', ['minify']);

gulp.task('less',
	LESS_DIST_FILES.map(function(name) {
		return createLessTask(name, path.resolve(STATIC_LESS, name));
	})
);

gulp.task('watch', function(cb) {
	livereload.listen({
		port: config.LIVERELOAD_PORT,
		host: '0.0.0.0'
	});

	gulp.watch([STATIC_LESS + '/*.less'], ['less']);
	gulp.watch([TEMAPLTES_DIST_FILES], ['templates']);

	gulp.start('compile');
});

gulp.task('vendors', function() {
	var b = browserify();

	VENDOR_LIBS.forEach(function(id) {
		b.require(resolve.sync(id), { expose: id });
	});

	return b.bundle()
	.on('error', handleError)
	.pipe(source(VENDOR_DIST_FILE))
	.pipe(gulp.dest(STATIC_DIR));
});

gulp.task('scripts', ['templates'], function() {
	var b = browserify(CLIENT_SRC, {
		cache: {},
		paths: BROWSERIFY_PATHS,
		extensions: ['js']
	});

	VENDOR_LIBS.forEach(function(id) {
		b.external(id);
	});

	if (livereload.server) {
		b = watchify(b);
		b.on('update', scripts);
		b.on('log', gutil.log);
		return scripts();
	} else {
		return scripts();
	}

	function scripts() {
		var stream = b.bundle()
		.on('error', handleError)
		.pipe(source(CLIENT_DIST))
		.pipe(buffer())
		.pipe(gulp.dest(STATIC_DIR));

		stream = handleLivereloadStream(stream);

		return stream;
	}
});

gulp.task('templates', function() {
	return gulp.src(TEMAPLTES_DIST_FILES)
	.pipe(templateCache({
		standalone: true,
		templateHeader: 'require("angular").module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {'
	}))
	.on('error', handleError)
	.pipe(gulp.dest('public'));
});

// ==============

function createLessTask(name, file) {
	gulp.task(name, task);
	return name;

	function task() {
		var paths = [
			path.resolve(__dirname),
			STATIC_LESS
		];

		var stream = gulp.src(file)
		.pipe(less({ paths: paths }))
		.on('error', handleError)
		.pipe(gulp.dest(STATIC_DIR));

		stream = handleLivereloadStream(stream);

		return stream;
	}
}

function handleError(err) {
	gutil.log(err);
	this.emit('end');
}

function handleLivereloadStream(stream) {
	if (livereload.server) {
		stream = stream.pipe(livereload());
	}

	return stream;
}
