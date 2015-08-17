/**
 * Cropbox module of jQuery. A lightweight and simple plugin to crop your image. 
 * 
 * Belosludcev Vasilij https://github.com/bupy7
 * Homepage: https://github.com/bupy7/jquery-cropbox
 * v1.0.0
 */
"use strict";
(function ($) {
    // const
    var EVENT_MOUSE_DOWN = 'mousedown',
        EVENT_MOUSE_MOVE = 'mousemove',
        EVENT_MOUSE_UP = 'mouseup',
        EVENT_MOUSE_WHEEL = 'mousewheel',
        EVENT_RESIZE = 'resize',
        EVENT_CHANGE = 'change',
        EVENT_LOAD = 'load';
    // public properties
    var $th = null,
        $inputInfo = null,
        $frame = null,
        $image = null,
        $workarea = null,
        $membrane = null,
        $btnReset = null,
        $btnCrop = null,
        $inputFile = null,
        $resize = null,
        frameState = {},
        imageState = {},
        resizeState = {},
        sourceImage = new Image,
        $document = $(document),
        $window = $(window),
        ratio = 1,
        variants = [
            {
                width: 200,
                height: 200,
                minWidth: 200,
                minHeight: 200,
                maxWidth: 350,
                maxHeight: 350
            }
        ],
        indexVariant = 0;
    // public methods
    var methods = {
            init: function(options) {
                variants = options.variants || variants;
                $th = $(this); 
                $inputFile = $(options.selectors.inputFile);
                $inputInfo = $(options.selectors.inputInfo);   
                $btnReset = $(options.selectors.btnReset);
                $btnCrop = $(options.selectors.btnCrop);
                initComponents();
                initEvents();
            }
        };
    // private methods
    var initComponents = function() {
            $image = $th.find('.image-cropbox');
            $frame = $th.find('.frame-cropbox');
            $workarea = $th.find('.workarea-cropbox');
            $membrane = $th.find('.membrane-cropbox');
            $resize = $th.find('.resize-cropbox');
        },
        initEvents = function() {
            // move frame
            $frame.on(EVENT_MOUSE_DOWN, frameMouseDown);
            $frame.on(EVENT_MOUSE_MOVE, frameMouseMove);
            $document.on(EVENT_MOUSE_UP, frameMouseUp);
            // resize frame
            $resize.on(EVENT_MOUSE_DOWN, resizeMouseDown);
            $document.on(EVENT_MOUSE_MOVE, resizeMouseMove);
            $document.on(EVENT_MOUSE_UP, resizeMouseUp);
            // move image
            $membrane.on(EVENT_MOUSE_DOWN, imageMouseDown);
            $membrane.on(EVENT_MOUSE_MOVE, imageMouseMove);
            $membrane.on(EVENT_MOUSE_UP, imageMouseUp);
            $membrane.on(EVENT_MOUSE_WHEEL, imageMouseWheel);
            // window resize
            $window.on(EVENT_RESIZE, resizeWorkarea);
            // select image file
            $inputFile.on(EVENT_CHANGE, function() {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(this.files[0]);
                $(fileReader).one(EVENT_LOAD, loadImage);
            });
        },
        initFrame = function() {
            resetRatio();
            var left = $workarea.width() / 2 - variants[indexVariant].width / 2,
                top = $workarea.height() / 2 - variants[indexVariant].height / 2;
            $frame.css({
                width: variants[indexVariant].width,
                height: variants[indexVariant].height,
                left: left,
                top: top,
                backgroundImage: 'url("' + sourceImage.src + '")',
                backgroundSize: $image.width() + 'px ' + $image.height() + 'px'
            });
            refrashPosFrame(left, top);    
        },
        refrashPosFrame = function(left, top) {
            var imgLeft = $image.position().left,
                imgTop = $image.position().top,
                x = imgLeft - left,
                y = imgTop - top;
            if (x > 0) {
                x = 0;
                left = imgLeft;
            } else if ($image.width() + imgLeft < left + $frame.width()) {
                x = $frame.width() - $image.width();
                left = imgLeft + $image.width() - $frame.width();
            } 
            if (y > 0) {
                y = 0;
                top = imgTop;
            } else if ($image.height() + imgTop < top + $frame.height()) {
                y = $frame.height() - $image.height();
                top = imgTop + $image.height() - $frame.height();
            }
            $frame.css({
                left: left,
                top: top,
                backgroundPosition: x + 'px ' + y + 'px'
            });
        },
        refrashSizeFrame = function(width, height) {
            var imgLeft = $image.position().left,
                imgTop = $image.position().top,
                frameLeft = $frame.position().left,
                frameTop = $frame.position().top;
            if ($image.width() + imgLeft < frameLeft + width) {
                width = $image.width() + imgLeft - frameLeft;
            }
            if ($image.height() + imgTop < frameTop + height) {   
                height = $image.height() + imgTop - frameTop;
            }
            $frame.css({width: width, height: height});
        },
        frameMouseDown = function(event) {
            frameState.dragable = true;
            frameState.mouseX = event.clientX;
            frameState.mouseY = event.clientY;
        },
        frameMouseMove = function(event) {
            if (frameState.dragable) {
                var leftOld = $frame.position().left,
                    topOld = $frame.position().top,
                    left = event.clientX - frameState.mouseX + leftOld,
                    top = event.clientY - frameState.mouseY + topOld;

                frameState.mouseX = event.clientX;
                frameState.mouseY = event.clientY;
                refrashPosFrame(left, top);
            }
        },
        frameMouseUp = function() {
            frameState.dragable = false;
        },
        resizeMouseDown = function(event) {
            event.stopImmediatePropagation();    

            resizeState.dragable = true;
            resizeState.mouseX = event.clientX;
            resizeState.mouseY = event.clientY;
        },
        resizeMouseMove = function(event) {
            if (resizeState.dragable) {
                var widthOld = $frame.width(),
                    heightOld = $frame.height(),
                    width = event.clientX - resizeState.mouseX + widthOld,
                    height = event.clientY - resizeState.mouseY + heightOld;

                resizeState.mouseX = event.clientX;
                resizeState.mouseY = event.clientY;
                refrashSizeFrame(width, height);
            }
        },
        resizeMouseUp = function(event) {
            event.stopImmediatePropagation();    

            resizeState.dragable = false;
        },
        imageMouseDown = function(event) {
            imageState.dragable = true;
            imageState.mouseX = event.clientX;
            imageState.mouseY = event.clientY;
        },
        imageMouseMove = function(event) {
            if (imageState.dragable) {
                var leftOld = $image.position().left,
                    topOld = $image.position().top,
                    left = event.clientX - imageState.mouseX + leftOld,
                    top = event.clientY - imageState.mouseY + topOld;

                imageState.mouseX = event.clientX;
                imageState.mouseY = event.clientY;
                refrashImage(left, top);

                frameState.mouseX = event.clientX;
                frameState.mouseY = event.clientY;
                refrashPosFrame($frame.position().left, $frame.position().top);
            }
        },
        imageMouseUp = function() {
            imageState.dragable = false;
        },
        refrashImage = function(left, top) {
            $image.css({left: left, top: top});
        },
        loadImage = function(event) {
            $(sourceImage).one(EVENT_LOAD, function() {
                $image.one(EVENT_LOAD, function() {
                    var left = sourceImage.width / 2 - $workarea.width() / 2,
                        top = sourceImage.height / 2 - $workarea.height() / 2;
                    refrashImage(-left, -top);
                    initFrame();  
                });
                $image.attr('src', this.src);
            });
            sourceImage.src = event.target.result;
        },
        resizeWorkarea = function() { 
            var left = sourceImage.width / 2 - $workarea.width() / 2,
                top = sourceImage.height / 2 - $workarea.height() / 2;
            refrashImage(-left, -top);
            resetRatio();
            initFrame();
        },
        imageMouseWheel = function(event) {
            if (event.deltaY > 0) {              
                zoomIn();
            } else {
                zoomOut();
            }
            event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        },
        zoomIn = function() {
            ratio *= 1.01;
            var width = sourceImage.width * ratio,
                height = sourceImage.height * ratio;
            zoom(width, height);
            refrashPosFrame($frame.position().left, $frame.position().top);
        },
        zoomOut = function() {
            var oldRatio = ratio;
            ratio *= 0.99;
            var width = sourceImage.width * ratio,
                height = sourceImage.height * ratio;
            if (width >= $frame.width() && height >= $frame.height()) {
                zoom(width, height);
                refrashPosFrame($frame.position().left, $frame.position().top);
            } else {
                ratio = oldRatio;
            }
        },
        zoom = function(width, height) {
            $image.css({width: width, height: height});
            $frame.css({backgroundSize: width + 'px ' + height + 'px'});
        },
        resetRatio = function() {
            if ($frame.width() > sourceImage.width || $frame.height() > sourceImage.height) {
                var wRatio = $frame.width() / sourceImage.width,
                    hRatio = $frame.height() / sourceImage.height;
                if (wRatio > hRatio) {
                    ratio = wRatio;
                } else {
                    ratio = hRatio;
                }
            } else {
                ratio = 1;
            }
            zoom(sourceImage.width * ratio, sourceImage.height * ratio);
        };
        
    $.fn.cropbox = function(options) {
        if (methods[options]) {
			return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof options === 'object' || ! options) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method "' +  options + '" not exists.');
		}
    };  
})(jQuery);
