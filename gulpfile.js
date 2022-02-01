/*
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
========================================
========================================
========================================
----------------------------------------
USWDS SASS GULPFILE
----------------------------------------
*/

const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const gulp = require("gulp");
const pkg = require("./node_modules/uswds/package.json");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require("gulp-sourcemaps");
const uswds = require("./node_modules/uswds-gulp/config/uswds");
const del = require("del");
const svgSprite = require("gulp-svg-sprite");
const rename = require("gulp-rename");
const connect = require('gulp-connect');
const fileinclude = require('gulp-file-include');

/*
----------------------------------------
PATHS
----------------------------------------
- All paths are relative to the
  project root
- Don't use a trailing `/` for path
  names
----------------------------------------
*/

// Project Sass source directory
const PROJECT_SASS_SRC = "./assets/sass";
const PROJECT_HTML_SRC = "./assets/html";
const PROJECT_IMG_SRC = "./assets/img";
const PROJECT_JS_SRC = "./assets/js";

// Images destination
const IMG_DEST = "./dist/assets/img";

// Fonts destination
const FONTS_DEST = "./dist/assets/fonts";

// Javascript destination
const JS_DEST = "./dist/assets/js";

// HTML destination
const HTML_DEST = "./dist";

// Compiled CSS destination
const CSS_DEST = "./dist/assets/css";

// Site CSS destination
// Like the _site/assets/css directory in Jekyll, if necessary.
// If using, uncomment line 106
const SITE_CSS_DEST = "./path/to/site/css/destination";

/*
----------------------------------------
TASKS
----------------------------------------
*/

gulp.task("copy-uswds-setup", () => {
  return gulp
    .src(`${uswds}/scss/theme/**/**`)
    .pipe(gulp.dest(`${PROJECT_SASS_SRC}`));
});

gulp.task("copy-uswds-fonts", () => {
  return gulp.src(`${uswds}/fonts/**/**`).pipe(gulp.dest(`${FONTS_DEST}`));
});

gulp.task("copy-uswds-images", () => {
  return gulp.src(`${uswds}/img/**/**`).pipe(gulp.dest(`${IMG_DEST}`));
});

gulp.task("copy-uswds-js", () => {
  return gulp.src(`${uswds}/js/**/**`).pipe(gulp.dest(`${JS_DEST}`));
});

gulp.task("copy-html", () => {
  return gulp.src(`${PROJECT_HTML_SRC}/*.html`)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: `${PROJECT_HTML_SRC}/partials`
    }))
    .pipe(gulp.dest(`${HTML_DEST}`))
    .pipe(connect.reload());
});

gulp.task("copy-img", () => {
  return gulp.src(`${PROJECT_IMG_SRC}/*.*`)
    .pipe(gulp.dest(`${IMG_DEST}`))
    .pipe(connect.reload());
});

gulp.task("copy-js", () => {
  return gulp.src(`${PROJECT_JS_SRC}/*.js`)
    .pipe(gulp.dest(`${JS_DEST}`))
    .pipe(connect.reload());
});

gulp.task("build-sass", function (done) {
  var plugins = [
    // Autoprefix
    autoprefixer({
      cascade: false,
      grid: true,
    }),
    // Minify
    csso({ forceMediaMerge: false }),
  ];
  return (
    gulp
      .src([`${PROJECT_SASS_SRC}/*.scss`])
      .pipe(sourcemaps.init({ largeFile: true }))
      .pipe(
        sass.sync({
          includePaths: [
            `${PROJECT_SASS_SRC}`,
            `${uswds}/scss`,
            `${uswds}/scss/packages`,
          ],
        })
      )
      .pipe(replace(/\buswds @version\b/g, "based on uswds v" + pkg.version))
      .pipe(postcss(plugins))
      .pipe(sourcemaps.write("."))
      // uncomment the next line if necessary for Jekyll to build properly
      //.pipe(gulp.dest(`${SITE_CSS_DEST}`))
      .pipe(gulp.dest(`${CSS_DEST}`))
      .pipe(connect.reload())
  );
});

// SVG sprite configuration
config = {
  shape: {
    dimension: {
      // Set maximum dimensions
      maxWidth: 24,
      maxHeight: 24,
    },
    id: {
      separator: "-",
    },
    spacing: {
      // Add padding
      padding: 0,
    },
  },
  mode: {
    symbol: true, // Activate the «symbol» mode
  },
};

gulp.task("build-sprite", function (done) {
  gulp
    .src(`${IMG_DEST}/usa-icons/**/*.svg`, {
      allowEmpty: true,
    })
    .pipe(svgSprite(config))
    .on("error", function (error) {
      console.log("There was an error");
    })
    .pipe(gulp.dest(`${IMG_DEST}`))
    .on("end", function () {
      done();
    });
});

gulp.task("rename-sprite", function (done) {
  gulp
    .src(`${IMG_DEST}/symbol/svg/sprite.symbol.svg`, {
      allowEmpty: true,
    })
    .pipe(rename(`${IMG_DEST}/sprite.svg`))
    .pipe(gulp.dest(`./`))
    .on("end", function () {
      done();
    });
});

gulp.task("clean-sprite", function (cb) {
  cb();
  return del.sync(`${IMG_DEST}/symbol`);
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task(
  "init",
  gulp.series(
    "copy-uswds-setup",
    "copy-uswds-fonts",
    "copy-uswds-images",
    "copy-uswds-js",
    "copy-html",
    "copy-img",
    "copy-js",
    "build-sass"
  )
);

gulp.task("watch-source", function () {
  gulp.watch(`${PROJECT_SASS_SRC}/**/*.scss`, gulp.series("build-sass"));
  gulp.watch(`${PROJECT_HTML_SRC}/**/*.html`, gulp.series("copy-html"));
  gulp.watch(`${PROJECT_IMG_SRC}/**/*.*`, gulp.series("copy-img"));
  gulp.watch(`${PROJECT_JS_SRC}/**/*.js`, gulp.series("copy-js"));
});

gulp.task("watch", gulp.parallel("connect", gulp.series("build-sass", "copy-html", "copy-img", "copy-js", "watch-source")));

gulp.task("default", gulp.series("watch"));

gulp.task(
  "svg-sprite",
  gulp.series("build-sprite", "rename-sprite", "clean-sprite")
);