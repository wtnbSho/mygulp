//----------------------------------------------------------------------
//  mode
//----------------------------------------------------------------------
'use strict';

//----------------------------------------------------------------------
//  require
//----------------------------------------------------------------------
const gulp = require('gulp');
const { src, dest, series, parallel, watch } = require('gulp');

const dartSass = require('gulp-sass')(require('sass'));

const del = require('del');
const bs = require('browser-sync');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');

const postcss = require('gulp-postcss');
const cssdeclsort = require('css-declaration-sorter');

const $ = require('gulp-load-plugins')();

//----------------------------------------------------------------------
//  path
//----------------------------------------------------------------------
const proj = {
	dev: './src',
	pro: './dist',
};

const paths = {
	clean: {
		src: `${proj.pro}/**`,
	},
	css: {
		src: `${proj.dev}/css/**`,
		dest: `${proj.pro}/css`,
	},
	font: {
		src: `${proj.dev}/css/fonts/**`,
		dest: `${proj.pro}/css/fonts`,
	},
	gif: {
		src: `${proj.dev}/css/ajax-loader.gif`,
		dest: `${proj.pro}/css/`,
	},
	html: {
		src: `${proj.dev}/**/*.html`,
		dest: `${proj.pro}/`,
	},
	php: {
		src: `${proj.dev}/**/*.php`,
		dest: `${proj.pro}/`,
	},
	images: {
		src: `${proj.dev}/images/**`,
		dest: `${proj.pro}/images`,
	},
	js: {
		src: `${proj.dev}/js/**/*.js`,
		dest: `${proj.pro}/js`,
	},
	scss: {
		src: `${proj.dev}/scss/**.scss`,
		dest: `${proj.dev}/css/`,
	},
	vendor: {
		src: `${proj.dev}/vendor/**`,
		dest: `${proj.pro}/vendor`,
	},

	watch: {
		src: [`${proj.dev}/**`, `!${proj.dev}/css/**`],
	},
};

const bsConf = {
	base: `./`,
	start: `${proj.dev}/index.html`,
};

//----------------------------------------------------------------------
//  task
//----------------------------------------------------------------------
const clean = (done) => {
	del(paths.clean.src);

	done();
};

const development = (done) => {
	// css
	// 処理なし

	// font
	// 処理なし

	// html
	// 処理なし

	// images
	// 処理なし

	// js
	// 処理なし

	// sass
	const postcssPlugins = [
		cssdeclsort({ order: 'smacss' })
	];
	src(paths.scss.src, { sourcemaps: true }) // コンパイル
		.pipe($.plumber())
		.pipe($.sassGlobUseForward())
		.pipe(dartSass())
		.pipe(postcss(postcssPlugins))
		.pipe($.autoprefixer())
		.pipe(dest(paths.scss.dest, { sourcemaps: './sourcemaps' }));

	// vendor
	// 処理なし

	done();
};

const production = (done) => {
	// css
	src([paths.css.src,'!src/css/sourcemaps/**','!src/css/fonts/**','!src/css/ajax-loader.gif']) // パージ、圧縮、コピー
		.pipe($.plumber())
		.pipe(
			$.purgecss({
				content: [paths.html.src,paths.php.src, paths.js.src],
			})
		)
		.pipe($.cleanCss())
		.pipe(dest(paths.css.dest));

	// font
	src(paths.font.src) // コピー
		.pipe($.plumber())
		.pipe(dest(paths.font.dest));

	// gif
	src(paths.gif.src) // コピー
		.pipe($.plumber())
		.pipe(dest(paths.gif.dest));

	// html
	src(paths.html.src) // コピー
		.pipe($.plumber())
		.pipe(dest(paths.html.dest));

	// php
	src(paths.php.src) // コピー
		.pipe($.plumber())
		.pipe(dest(paths.php.dest));

	// images
	src(paths.images.src) // 圧縮、コピー
		.pipe($.plumber())
		.pipe($.changed(paths.images.dest))
		.pipe(
			$.imagemin([
				pngquant({
					quality: [0.8, 0.9],
					speed: 1,
				}),
				mozjpeg({ quality: 85 }),
				// $.imagemin.svgo(),
				$.imagemin.optipng(),
				$.imagemin.gifsicle({
					optimizationLevel: 3,
				}),
			])
		)
		.pipe(dest(paths.images.dest));

	// js
	src(paths.js.src) // 圧縮、コピー
		.pipe($.plumber())
		.pipe($.uglify())
		.pipe(dest(paths.js.dest));

	// sass
	// 処理なし

	// vendor
	src(paths.vendor.src) // コピー
		.pipe($.plumber())
		.pipe(dest(paths.vendor.dest));

	done();
};

const bsInit = (done) => {
	bs.init({
		server: {
			baseDir: bsConf.base,
		},
		startPath: bsConf.start,
		notify: false,
		open: 'external',
	});

	done();
};

const bsReload = (done) => {
	bs.reload();

	done();
};

//----------------------------------------------------------------------
//  watchTask
//----------------------------------------------------------------------
const watchTask = (done) => {
	watch(paths.watch.src, series(development, bsReload));

	done();
};

//----------------------------------------------------------------------
//  export
//----------------------------------------------------------------------
exports.clean = clean;
exports.development = series(development, bsInit, bsReload, watchTask);
exports.production = series(production);

/************************************************************************/
/*  END OF FILE                                                         */
/************************************************************************/