Pace.on("done", function () {
    //video.onplay = function () {
    //    onFinish();
    //}
    onFinish.done = true;
    $( "#start-btn" ).click(onFinish);
});

var video = document.querySelector('#firstChapter');
video.addEventListener('progress', function (e) {
    if (e.total && e.loaded) {
        // percentage of video loaded
        var proportion = Math.round(e.loaded / e.total);
        console.log(proportion * 100);
    } else {
        // do nothing because we're autobuffering.
    }
    //console.log(video.HAVE_ENOUGH_DATA);

    onFinish();
});
/*video.onplay = function () {
 console.log('loaded',video.HAVE_ENOUGH_DATA);
 }*/

function onFinish() {
    if (!onFinish.iter)onFinish.iter = 1;
    if (++onFinish.iter > 2 && onFinish.done && !onFinish.start) {
        onFinish.start = !0;
        start();
        console.clear();
    }
}


function start() {

    $("#textLanding").css("display", "none");
    $("#menuLanding").css("display", "flex");

    var mediaData = {
        list: [
            //'ostWav',
            'firstWav', 'secondWav', 'transition1to2', 'firstChapter', 'transition2to3',
            //'thirdChapterSound',
            'closedEye', 'openEye', 'voiceUp', 'voiceDown', 'thirdChapter']
    };
    mediaData.list.forEach(function (_id) {
        var elemMedia = document.getElementById(_id);
        elemMedia.currentTime = 0.0;
        elemMedia.volume = 1.0;
        mediaData[_id] = elemMedia;
    });

    var render = $("#render");
    var thecanvas = document.getElementById('thecanvas');
    $("#thecanvas").css("height", $("#thirdChapter").css("height"));
    $("#thecanvas").css("width", $("#thirdChapter").css("width"));

    var eye = $("#eye");

    window.addEventListener("message", function (event) {
        var action = event.data;
        switch (action) {
            case 'GO_TO_THREE_CHAPTER':
            {
                state.listTimeouts.push(setTimeout(function () {
                    state.fillDark(function () {
                        if (state.level == 2) $("#thirdScene").click();
                    });
                }, 3 * 1000));
                break;
            }
        }
    });
    function pauseContent() {
        mediaData.list.forEach(function (field) {
            mediaData[field].pause();
        });
    }

    function resetStart() {

        mediaData.list.forEach(function (field) {
            mediaData[field].currentTime = 0.0;
        });
    }

    var mouseX;
    var mouseY;
    var percentY;
    var percentX;

    // animation for scene 1
    function audioCtrl(event) {

        mouseX = event.clientX || event.pageX;
        mouseY = event.clientY || event.pageY;

        var xLow = 1 - percentX / 50,
            sizeY = window.innerHeight,
            sizeW = window.innerWidth,
            hotPointSizeX = sizeW / 3,
            halfHotPointSizeX = hotPointSizeX / 2,
            hotPointSizeY = sizeY / 2,
            halfHotPointSizeY = hotPointSizeY / 2,
            minLimit = 0.1,
            result = {},
            calcs = {
                xToLow: function xToLow(percentX) {
                    return 1 - percentX >= 0 && 1 - percentX < minLimit ? minLimit : 1 - percentX;
                },
                xToUp: function xToUp(percentX) {
                    return percentX < minLimit ? minLimit : percentX;
                },
                getXLowY: function getXLowY(percentX, percentY) {
                    var outOfRange = percentX > 1 || percentY > 1;

                    if (percentX > percentY) {
                        result.secondWav = calcs.xToLow(percentX);
                        result.firstWav = calcs.xToUp(percentX);
                    } else {
                        result.secondWav = calcs.xToLow(percentY);
                        result.firstWav = calcs.xToUp(percentY);
                    }
                    result.secondWav *= outOfRange ? -1 : 1;
                    result.firstWav = outOfRange ? 2 - result.firstWav : result.firstWav;
                },
                getXTopY: function getXTopY(percentX, percentY) {
                    var outOfRange = percentX > 1 || percentY > 1;

                    if (percentX > percentY) {
                        result.secondWav = calcs.xToUp(percentX);
                        result.firstWav = calcs.xToLow(percentX);
                    } else {
                        result.secondWav = calcs.xToUp(percentY);
                        result.firstWav = calcs.xToLow(percentY);
                    }

                    result.firstWav *= outOfRange ? -1 : 1;
                    result.secondWav = outOfRange ? 2 - result.secondWav : result.secondWav;
                }
            };

        if (mouseX < hotPointSizeX) {
            result.n = "first";

            percentX = mouseX / halfHotPointSizeX;
            if (mouseY < hotPointSizeY) {
                percentY = mouseY / halfHotPointSizeY;
                calcs.getXLowY(percentX, percentY);
            } else {
                percentY = (mouseY - hotPointSizeY) / halfHotPointSizeY;
                calcs.getXTopY(percentX, percentY);
            }
        } else if (mouseX >= hotPointSizeX && mouseX < 2 * hotPointSizeX) {
            result.n = "second";

            percentX = (mouseX - hotPointSizeX) / halfHotPointSizeX;
            if (mouseY < hotPointSizeY) {
                percentY = mouseY / halfHotPointSizeY;
                calcs.getXLowY(percentX, percentY);
            } else {
                percentY = (mouseY - hotPointSizeY) / halfHotPointSizeY;
                calcs.getXTopY(percentX, percentY);
            }
            var prevF = result.firstWav;
            result.firstWav = result.secondWav;
            result.secondWav = prevF;
        } else {
            result.n = "three";

            percentX = (mouseX - 2 * hotPointSizeX) / halfHotPointSizeX;
            if (mouseY < hotPointSizeY) {

                percentY = mouseY / halfHotPointSizeY;
                calcs.getXLowY(percentX, percentY);
            } else {

                percentY = (mouseY - hotPointSizeY) / halfHotPointSizeY;
                calcs.getXTopY(percentX, percentY);
            }
        }

        if (mouseX >= sizeW / 2 - sizeW / 4 && mouseX <= sizeW / 2 + sizeW / 4 && mouseY >= sizeY / 2 - sizeY / 4 && mouseY <= sizeY / 2 + sizeY / 4) {
            onLeaveAreas();
        } else {
            onLeaveAreas.list[0].volume = result.secondWav;
            onLeaveAreas.list[1].volume = result.firstWav; //firstWav
            if (onLeaveAreas.list[2]) onLeaveAreas.list[2].volume = 1.0;
        }
    }

    // draw the frame before eye closed for scene 3
    function draw(image, thecanvas) {

        var context = thecanvas.getContext('2d');

        context.drawImage(image, 0, 0, thecanvas.width, thecanvas.height);
    }

    //animation for scene 3
    var curPos = true;

    function animScene(event) {

        if (state.ispaused) return;
        //
        if (thirdChapter.currentTime >= 0 && thirdChapter.currentTime <= 28) {
            //mediaData.thirdChapter.play();
            $(mediaData.thirdChapter).show();
            if (mediaData.voiceUp.paused) mediaData.voiceUp.play();
            if (mediaData.voiceDown.paused) mediaData.voiceDown.play();
            return audioCtrl(event);
        }

        mouseY = event.clientY || event.pageY;

        var noInteraction = thirdChapter.currentTime > 28 && thirdChapter.currentTime <= 69;
        mediaData.thirdChapter.volume = noInteraction ? 0.0 : 1.0;
        var eyeOpen = noInteraction ? mouseY * 8 / window.innerHeight * 100 - 350 : 0;
        eye.css({ height: eyeOpen + "%" });

        if (!noInteraction) {
            mediaData.closedEye.pause();
            mediaData.openEye.pause();
        } else {
            if (mediaData.closedEye.paused) mediaData.closedEye.play();
            if (mediaData.openEye.paused) mediaData.openEye.play();
            mediaData.closedEye.volume = mouseY / window.innerHeight;
            mediaData.openEye.volume = 1 - mouseY / window.innerHeight;
            console.log(mediaData.closedEye.volume, mediaData.openEye.volume, mediaData.closedEye.currentTime);
        }
        if (noInteraction && mouseY / window.innerHeight * 100 > 50 && eye.css("display") == "block") {

            if (curPos) {
                burEffect.isEyeClose = true;
                mediaData.thirdChapter.classList.remove("eyeClose");
                mediaData.thirdChapter.classList.remove('eye-open-force');
                burEffect(mediaData.thirdChapter, 1);
                mediaData.thirdChapter.pause();
                curPos = false;
            }
        } else {

            if (!curPos || !noInteraction) {
                burEffect.isEyeClose = false;
                mediaData.thirdChapter.classList.remove('eyeClose');
                burEffect(mediaData.thirdChapter);
                state.clearTmers();
                state.listTimeouts.push(setTimeout(function () {
                    if (burEffect.isEyeClose) return burEffect.isEyeClose = false;
                    mediaData.thirdChapter.classList.remove('eyeOpen');
                    mediaData.thirdChapter.classList.add('eye-open-force');
                }, 5000));
                mediaData.thirdChapter.play();
                curPos = true;
            }
        }
        if (!noInteraction) {
            mediaData.thirdChapter.classList.remove('eye-open-force');
            mediaData.thirdChapter.classList.remove('eyeClose');
            mediaData.thirdChapter.classList.remove('eyeOpen');
        }
    }

    function onLeaveAreas() {
        var leavListSounds = onLeaveAreas.list || [];

        //for (var i = 0; i < leavListSounds.length; i++) {
        //    leavListSounds[i].volume = 0.0;
        //}
        //return;
        var curVol = 0;
        for (var i = 0; i < leavListSounds.length; i++) {
            if (curVol < leavListSounds[i].volume) curVol = leavListSounds[i].volume;
        }
        if (curVol <= 0 || onLeaveAreas.workes) return;
        onLeaveAreas.workes = !0;
        var interv = setInterval(function () {
            curVol -= 0.04;
            if (curVol <= 0) {
                clearInterval(interv);
                curVol = 0;
                onLeaveAreas.workes = !1;
            }
            for (var i = 0; i < leavListSounds.length; i++) {
                leavListSounds[i].volume = curVol;
            }
            //console.log(curVol);
        }, 15);
    }

    function firstChapterAnim(event) {

        mouseY = event.clientY || event.pageY;
    }

    window.addEventListener("mouseout", onLeaveAreas, true);

    var _render = new function () {
        var curElem = document.querySelector('#render'),
            iframeWindow = document.querySelector('#iframe').contentWindow;
        this.clear = function () {
            curElem.innerHTML = '';
        };
        this.fill = function () {
            curElem.innerHTML = '<iframe id="iframe" src="test/octavia/" frameborder="0"></iframe>';
            var _iframe = curElem.childNodes[0];
            _iframe.onload = function () {
                console.log("iframe was loaded'");
                _iframe.contentWindow.postMessage({ draw: true }, "/");
            };
        };

        this.draw = function (draw) {
            render.css("display", draw ? "block" : "none");
            render.css("left", "0");
            iframeWindow.postMessage({ draw: draw }, "/");
        };
    }();
    var state = new function () {
        var listTimeouts = [];
        this.listTimeouts = listTimeouts;
        this.lastFunctions = [];
        this.clearTmers = clearTmers;

        this.update = function (value) {
            while (this.lastFunctions.length) {
                this.lastFunctions.shift()();
            }

            this.level = value;
            resetStart();
            pauseContent();
            clearTmers();
            this.fillDark(0, 1);
            onLeaveAreas.list = [];

            switch (value) {
                case 1:
                {
                    onLeaveAreas.list = [mediaData.secondWav, mediaData.firstWav];
                    mediaData.firstWav.play();
                    mediaData.secondWav.play();
                    mediaData.firstChapter.play();
                    break;
                }
                case 2:
                {
                    mediaData.transition1to2.play();
                    break;
                }
                case 3:
                {
                    onLeaveAreas.list = [mediaData.voiceUp, mediaData.voiceDown];
                    mediaData.transition2to3.play();
                    mediaData.thirdChapter.play();
                    //mediaData.thirdChapterSound.play();

                    //$(mediaData.thirdChapterSound).animate({volume: 1}, 1500);
                    // mediaData.openEye.play();
                    // mediaData.closedEye.play();
                    mediaData.openEye.volume = 0.1;
                    mediaData.closedEye.volume = 1;
                    break;
                }
            }
        };
        this.fillDark = function (callback, fillSt) {
            var fill = jQuery('#textLanding');
            fill.find('.afterload-wrap').css('display', 'none');

            if (fillSt) {
                fill['fadeOut']('slow');
            } else {
                //fill.css('display', 'block');
                fill['fadeIn']('slow', callback);
                //setTimeout(callback,900);
            }
        };

        function clearTmers() {
            if (listTimeouts.length) {
                clearTimeout(listTimeouts.shift());
                clearTmers();
            }
        }
    }();

    '#content,#thecanvas,#eye,#render'.split(',').forEach(function (o) {
        document.querySelector(o).style.display = 'block';
    });

    $("#firstScene").click(function () {
        if (state.level == 1) {
            return false;
        }

        state.fillDark(function () {

            $("#secondScene").removeClass("activeScene");
            $("#thirdScene").removeClass("activeScene");
            $(thecanvas).show();
            $("#thirdChapter").hide();
            mediaData.firstChapter.classList.remove("eyeClose");
            eye.css("display", "none");
            $(thecanvas).hide();
            //iframeBtn.css("display", "none");

            _render.draw();

            $("#firstScene").addClass("activeScene");
            $("#firstChapter").show();

            window.addEventListener("mousemove", audioCtrl, true);
            window.removeEventListener("mousemove", animScene, true);
            window.addEventListener("mousemove", firstChapterAnim, true);

            state.update(1);
        });
    }).click();

    $("#secondScene").click(function () {
        if (state.level == 2) {
            return false;
        }
        state.fillDark(function () {
            $("#firstScene").removeClass("activeScene");
            $("#thirdScene").removeClass("activeScene");
            _render.draw(!0);
            eye.css("display", "none");
            $(thecanvas).hide();

            $("#secondScene").addClass("activeScene");

            window.removeEventListener("mousemove", audioCtrl, true);
            window.removeEventListener("mousemove", animScene, true);

            state.update(2);
        });
    });

    $("#thirdScene").click(function () {

        if (state.level == 3) {
            return false;
        }
        state.fillDark(function () {
            $("#firstScene").removeClass("activeScene");
            $("#secondScene").removeClass("activeScene");
            eye.css("display", "block");
            //iframeBtn.css("display", "none");
            _render.draw();
            $("#firstChapter").hide();
            $(mediaData.thirdChapter).show();

            window.removeEventListener("mousemove", audioCtrl, true);
            window.addEventListener("mousemove", animScene, true);

            $("#thirdScene").addClass("activeScene");
            burEffect(mediaData.thirdChapter);

            state.update(3);
        });
    });

    var listeners = [mediaData.firstChapter, mediaData.thirdChapter];

    function burEffect(o, type) {

        thecanvas.classList.add("eyeClose");
        o.classList.remove("eyeOpen");
        //draw(o, thecanvas);
        //$(thecanvas).show().css({width: $(o).width(), height: $(o).height()});
        //$(o).hide();
        setTimeout(function () {
            thecanvas.classList.remove("eyeClose");
            o.classList.add(type ? "eyeClose" : "eyeOpen");
            $(o).show();
            $(thecanvas).hide();
        }, 100);
    }

    listeners.forEach(function (o) {

        o.addEventListener("mouseup", function () {
            burEffect(o);
        });
    });

    mediaData.firstChapter.addEventListener("ended", function () {
        if (state.level == 1) {
            window.addEventListener("mousemove", animScene, true);
            //eye.css("height", (mouseY * 8 / window.innerHeight) * 100 - 350 + "%");
            state.fillDark(function () {
                $("#secondScene").click();
            });
        }
    }, false);

    mediaData.thirdChapter.addEventListener("ended", function () {
        var delay = 1000;
        if (state.level == 3) {
            jQuery('.activeScene').removeClass('activeScene');
            jQuery('#final-titles').fadeIn(delay * 3.5, function () {
                sowParentMenu();
                pauseContent();
                //setTimeout(function () {
                state.lastFunctions.push(function () {
                    hideParentMenu();
                    jQuery('#final-titles').fadeOut('slow' /*,function(){return state.fillDark( function () {  $("#firstScene").click(); })}*/);
                });

                //}, delay * 20);
            });
        }

        window.removeEventListener("mousemove", animScene, true);
    }, false);

    window.parent.postMessage({ loadFinish: 1 }, location.origin);
    window.document.addEventListener("keydown", keyDownTextField, false);
    function keyDownTextField(e) {
        e.preventDefault();
        var keyCode = e.keyCode;
        if (keyCode == 27) {
            pauseContent();

            setTimeout(function () {
                document.getElementById('iframe').contentWindow.App.pauseContet();
                jQuery('#play-r').fadeIn(2000);
                sowParentMenu();
                state.lastFunctions.push(function () {
                    hideParentMenu();
                    jQuery('#play-r').fadeOut(200);
                });
            }, 1000);
        }
    }
    window.keyDownTextField = keyDownTextField;

    function sowParentMenu() {
        state.ispaused = true;
        jQuery('#xx').fadeIn();
        parent.postMessage({ PAUSE_CONTENT: 1 }, "/");
    }

    function hideParentMenu() {
        state.ispaused = false;
        parent.postMessage({ PLAY_CONTENT: 1 }, "/");
        jQuery('#xx').fadeOut();
    }

    jQuery('#play-r>img').click(function () {
        jQuery('#play-r').fadeOut(1000);
        hideParentMenu();

        switch (state.level) {
            case 1:
            {
                mediaData.firstChapter.play();
                mediaData.secondWav.play();
                mediaData.firstWav.play();
                break;
            }
            case 2:
            {
                document.getElementById('iframe').contentWindow.App.playContet();
                break;
            }
            case 3:
            {
                mediaData.thirdChapter.play();
                //mediaData.thirdChapterSound.play();
                break;
            }
        }
    });
};