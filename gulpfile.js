var gulp = require("gulp");
var utils = require("./gulputils.js");

var projects = {
    main: {
        path: ".",
        bundle: "{path}/bundle",
        processors: {
            javascript: {
                type: "es6", // ts|es5|es6|coffee
                folders: [
                    "{path}/src/javascripts/**/*.{type}",
                    "!{path}/src/javascripts/backups/**/*.{type}"
                ],
                entry: "{path}/src/javascripts/main.{type}"
            },
            stylesheet: {
                type: "less", // less|scss
                folders: [
                    "{path}/src/stylesheets/**/*.{type}",
                    "!{path}/src/stylesheets/backups/**/*.{type}"
                ],
                entry: "{path}/src/stylesheets/main.{type}"
            }
        },
        debug: true
    }
};

var main = utils(projects.main);

gulp.task("clean", function () {
    main.clean();
});

gulp.task("build:javascript", function () {
    main.build().javascript();
});

gulp.task("build:stylesheet", function () {
    main.build().stylesheet();
});

gulp.task("build", function () {
    main.build().javascript();
    main.build().stylesheet();
});

gulp.task("watch", ["build"], function () {
    main.watch(["build:javascript"]).javascript();
    main.watch(["build:stylesheet"]).stylesheet();
});

gulp.task("default", function () {
    gulp.start("build");
});
