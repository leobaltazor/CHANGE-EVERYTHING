var syntax = "sass"; // Syntax: sass or scss;

var gulp = require("gulp"),
    gutil = require("gulp-util"),
    sass = require("gulp-sass"),
    browserSync = require("browser-sync"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    del = require("del"),
    cleancss = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    autoprefixer = require("gulp-autoprefixer"),
    notify = require("gulp-notify"),
    imagemin = require("gulp-imagemin"),
    pngquant = require("imagemin-pngquant"),
    cache = require("gulp-cache"),
    rsync = require("gulp-rsync"),
    ftp = require("vinyl-ftp");

gulp.task("browser-sync", function() {
    browserSync({
        server: {
            baseDir: "app"
        },
        notify: false
        // open: false,
        // online: false, // Work Offline Without Internet Connection
        // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
    });
});

gulp.task("styles", function() {
    return gulp
        .src("app/" + syntax + "/**/*." + syntax + "")
        .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
        .pipe(rename({ suffix: ".min", prefix: "" }))
        .pipe(autoprefixer(["last 15 versions"]))
        .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

gulp.task("js", function() {
    return (
        gulp
            .src([
                "app/libs/jquery/dist/jquery.min.js",
                "app/libs/slick-carousel/slick/slick.min.js",
                "app/libs/scrollwatch/dist/ScrollWatch-2.0.1.min.js",
                "app/js/common.js" // Always at the end
            ])
            .pipe(concat("scripts.min.js"))
            // .pipe(uglify()) // Mifify js (opt.)
            .pipe(gulp.dest("app/js"))
            .pipe(browserSync.reload({ stream: true }))
    );
});

gulp.task("rsync", function() {
    return gulp.src("app/**").pipe(
        rsync({
            root: "app/",
            hostname: "username@yousite.com",
            destination: "yousite/public_html/",
            // include: ['*.htaccess'], // Includes files to deploy
            exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excludes files from deploy
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        })
    );
});

gulp.task("watch", ["styles", "js", "browser-sync"], function() {
    gulp.watch("app/" + syntax + "/**/*." + syntax + "", ["styles"]);
    gulp.watch(["libs/**/*.js", "app/js/common.js"], ["js"]);
    gulp.watch("app/*.html", browserSync.reload);
});

gulp.task("img", function() {
    return gulp
        .src("app/img/**/*") // Берем все изображения из app
        .pipe(
            cache(
                imagemin({
                    // Сжимаем их с наилучшими настройками с учетом кеширования
                    interlaced: true,
                    progressive: true,
                    svgoPlugins: [{ removeViewBox: false }],
                    use: [pngquant()]
                })
            )
        )
        .pipe(gulp.dest("build/img")); // Выгружаем на продакшен
});

gulp.task(
    "build",
    ["clearcache", "removedist", "styles", "js", "img"],
    function() {
        var buildFiles = gulp.src(["app/*.html"]).pipe(gulp.dest("build"));

        var buildCss = gulp
            .src(["app/css/main.min.css"])
            .pipe(gulp.dest("build/css"));

        var buildJs = gulp
            .src(["app/js/scripts.min.js"])
            .pipe(gulp.dest("build/js"));

        var buildFonts = gulp
            .src(["app/fonts/**/*"])
            .pipe(gulp.dest("build/fonts"));
    }
);
gulp.task("removedist", function() {
    return del.sync("build");
});
gulp.task("clearcache", function() {
    return cache.clearAll();
});

gulp.task("deploy", function() {
    var conn = ftp.create({
        host: "files.000webhost.com",
        user: "leobaltazor2",
        password: "GliubAsEviloci4",
        parallel: 5,
        log: gutil.log
    });

    var globs = ["build/**"];
    return gulp.src(globs, { buffer: false }).pipe(conn.dest("/public_html"));
});

gulp.task("default", ["watch"]);
