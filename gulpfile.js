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

const cssdeclsort = require('css-declaration-sorter');
const crypto = require('crypto');
const hash = crypto.randomBytes(8).toString('hex');

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
		src: `${proj.dev}/css/*.css`,
		dest: `${proj.pro}/css`,
	},
	cssOthers: {
		src: [`${proj.dev}/css/**`, `!${proj.dev}/css/sourcemaps/**`],
		dest: `${proj.pro}/css/`,
	},
	pug: {
		src: [`${proj.dev}/pug/**/*.pug`, `!${proj.dev}/pug/**/_*.pug`],
		dest: `${proj.dev}/`,
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

	watch: {
		src: [`${proj.dev}/**`, `!${proj.dev}/css/**`, `!${proj.dev}/**/*.html`],
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
	// ????????????

	// html
	// ????????????

	// Pug
	src(paths.pug.src) // Pug???????????????
	.pipe($.plumber())
	.pipe($.pug({
		pretty: true,
	}))
	.pipe(dest('./src/'));

	// images
	// ????????????

	// js
	// ????????????

	// sass
	const postcssPlugins = [
		cssdeclsort({ order: 'smacss' })
	];
	src(paths.scss.src, { sourcemaps: true }) // ???????????????
		.pipe($.plumber())
		.pipe($.sassGlobUseForward())
		.pipe(dartSass())
		.pipe($.postcss(postcssPlugins))
		.pipe($.autoprefixer())
		.pipe(dest(paths.scss.dest, { sourcemaps: './sourcemaps' }));

	done();
};

const production = (done) => {
	// css
	src(paths.css.src) // ??????????????????????????????
		.pipe($.plumber())
		.pipe(
		$.purgecss({
			content: [paths.html.src,paths.php.src, paths.js.src],
		})
		)
		.pipe($.groupCssMediaQueries())
		.pipe($.cleanCss())
		.pipe(dest(paths.css.dest));

	// cssOthers(?????????????????????????????????)
	src(paths.cssOthers.src) // ?????????
		.pipe($.plumber())
		.pipe(dest(paths.cssOthers.dest));

	// html
	src(paths.html.src) // ?????????
		.pipe($.plumber())
		// .pipe($.replace('/\.rev.(js|css)/g', '.rev=' + hash + '.$1'))
		.pipe(dest(paths.html.dest));

	// php
	src(paths.php.src) // ?????????
		.pipe($.plumber())
		.pipe(dest(paths.php.dest));

	// images
	src(paths.images.src) // ??????????????????
		.pipe($.plumber())
		.pipe($.changed(paths.images.dest))
		.pipe(
			$.imagemin([
				pngquant({
					quality: [0.7, 0.8],
					speed: 1,
				}),
				mozjpeg({ quality: 80 }),
				// $.imagemin.svgo(), // svg
				$.imagemin.optipng(),
				$.imagemin.gifsicle({
					optimizationLevel: 3,
				}),
			])
		)
		.pipe(dest(paths.images.dest));

	// js
	src(paths.js.src) // ??????????????????
		.pipe($.plumber())
		.pipe($.uglify())
		.pipe(dest(paths.js.dest));

	// sass
	// ????????????


	done();
};

const bsInit = (done) => {
	bs.init({
		// ----------------------------------------- HTML???

		server: {
				baseDir: bsConf.base,
			},
			startPath: bsConf.start,
			notify: false,
			open: 'external',

		// ----------------------------------------- HTML???

		// ========================================= PHP???

		// proxy: "localhost:80/mygulp/src/",//Apache Port???????????????&php??????????????????????????????????????????
		// index: "index.php"//?????????????????????????????????

		// ========================================= PHP???
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