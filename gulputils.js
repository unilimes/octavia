var gulp = require("gulp");
var less = require("gulp-less");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var cssmin = require("gulp-cssmin");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var gulpif = require("gulp-if");
var babelify = require("babelify");
var coffeeify = require("coffeeify");
var browserify = require("browserify");
var tsify = require("tsify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var del = require("del");

module.exports = function (project) {
    var processors = project.processors;

    var extensions = {
        "ts": "ts",
        "es5": "js",
        "es6": "js",
        "coffee": "coffee",
        "scss": "scss",
        "less": "less"
    };

    var pipes = {
        ts: function () {
            browserify(processors.javascript.entry, { basedir: project.path, debug: project.debug })
                .plugin(tsify, {
                    sourceMap: project.debug,
                    noImplicitAny: true,
                    target: "es5"
                })
                .bundle()
                .pipe(source("bundle.js"))
                .pipe(buffer())
                .pipe(gulpif(!project.debug, uglify()))
                .pipe(gulp.dest(project.bundle));
        },
        es5: function () {
            browserify(processors.javascript.entry, { debug: project.debug })
                .bundle()
                .pipe(source("bundle.js"))
                .pipe(buffer())
                .pipe(gulpif(!project.debug, uglify()))
                .pipe(gulp.dest(project.bundle));
        },
        es6: function () {
            browserify(processors.javascript.entry, { debug: project.debug })
                .transform(babelify, {
                    presets: ["es2015"],
                    plugins: ["transform-class-properties"]
                })
                .bundle()
                .pipe(source("bundle.js"))
                .pipe(buffer())
                .pipe(gulpif(!project.debug, uglify()))
                .pipe(gulp.dest(project.bundle));
        },
        coffee: function () {
            browserify(processors.javascript.entry, { debug: project.debug })
                .transform(coffeeify, {
                    extensions: ['.coffee']
                })
                .bundle()
                .pipe(source("bundle.js"))
                .pipe(buffer())
                .pipe(gulpif(!project.debug, uglify()))
                .pipe(gulp.dest(project.bundle));
        },
        less: function () {
            gulp.src(processors.stylesheet.entry)
                .pipe(gulpif(project.debug, sourcemaps.init()))
                .pipe(less())
                .pipe(gulpif(project.debug, sourcemaps.write()))
                .pipe(autoprefixer({
                    browsers: ["last 2 versions"],
                    cascade: false
                }))
                .pipe(gulpif(!project.debug, cssmin()))
                .pipe(rename("bundle.css"))
                .pipe(gulp.dest(project.bundle));
        },
        scss: function () {
            gulp.src(processors.stylesheet.entry)
                .pipe(gulpif(project.debug, sourcemaps.init()))
                .pipe(sass())
                .pipe(gulpif(project.debug, sourcemaps.write()))
                .pipe(autoprefixer({
                    browsers: ["last 2 versions"],
                    cascade: false
                }))
                .pipe(gulpif(!project.debug, cssmin()))
                .pipe(rename("bundle.css"))
                .pipe(gulp.dest(project.bundle));
        }
    };

    traverse(project, function (value, key, object) {
        if (typeof object[key] === "string") {
            var path = project.path || ".";
            object[key] = object[key].replace(/\{path\}/g, path);
        }
    });

    traverse(project, function (value, key, object) {
        if (typeof object[key] === "string") {
            var bundle = project.bundle || "./bundle";
            object[key] = object[key].replace(/\{bundle\}/g, bundle);
        }
    });

    traverse(processors.javascript, function (value, key, object) {
        if (typeof object[key] === "string") {
            var extension = extensions[processors.javascript.type] || processors.javascript.type;
            object[key] = object[key].replace(/\{type\}/g, extension);
        }
    });

    traverse(processors.stylesheet, function (value, key, object) {
        if (typeof object[key] === "string") {
            var extension = extensions[processors.stylesheet.type] || processors.stylesheet.type;
            object[key] = object[key].replace(/\{type\}/g, extension);
        }
    });

    function clean() {
        del(project.bundle);
    }

    function build(prebuild) {
        if (prebuild !== undefined) {
            gulp.start(prebuild);
        }

        function javascript() {
            pipes[processors.javascript.type]();
        }

        function stylesheet() {
            pipes[processors.stylesheet.type]();
        }

        return {
            javascript: javascript,
            stylesheet: stylesheet
        }
    }

    function watch(builder) {
        function javascript() {
            gulp.watch(processors.javascript.folders, builder);
        }

        function stylesheet() {
            gulp.watch(processors.stylesheet.folders, builder);
        }

        return {
            javascript: javascript,
            stylesheet: stylesheet
        }
    }

    function traverse(objects, callback) {
        for (var key in objects) {
            if (objects.hasOwnProperty(key)) {
                if (typeof objects[key] !== "object") {
                    if (callback.call({}, objects[key], key, objects) === false) {
                        return false;
                    }
                } else {
                    if (traverse(objects[key], callback) === false) {
                        return false;
                    }
                }
            }
        }
    }

    return {
        clean: clean,
        build: build,
        watch: watch
    };
};
