var gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require("browser-sync").create();

var paths = {
    styles: {
        src: "./web/styles/*.scss",
        dest: "web/css"
    }
};

function style() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on("error", sass.logError)
        .pipe(postcss([
            autoprefixer(), 
            cssnano()
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function reload() {
    browserSync.reload();
}

function watch() {
    browserSync.init({
        notify: false,
        proxy: "shipengquin.test"
    });
    gulp.watch("./web/styles/**/*.scss", style);
    gulp.watch("web/*.html").on('change', browserSync.reload);
}

exports.watch = watch
exports.style = style;

var build = gulp.parallel(style, watch);

gulp.task('default', build);