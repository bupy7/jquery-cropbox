/**
 * Cropbox module of jQuery. A lightweight and simple plugin to crop your image. 
 *    ___
 *   |   |
 *   |---|
 *   |   |
 *  /     \
 * /       \
 * |       |
 * | ВОДКА |
 * |       |
 * |       |
 * |_______| From Russia with love.
 * 
 * Belosludcev Vasilij https://github.com/bupy7
 * Homepage of extension: https://github.com/bupy7/jquery-cropbox
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
        EVENT_LOAD = 'load',
        EVENT_CLICK = 'click';
    // protected properties
    var $th = null,
        $frame = null,
        $image = null,
        $workarea = null,
        $membrane = null,
        $resize = null,
        frameState = {},
        imageState = {},
        resizeState = {},
        sourceImage = new Image,
        $document = $(document),
        $window = $(window),
        ratio = 1,
        indexVariant = 0,
        $backupResultContainer = null,
        // options of plugin
        $inputFile = null,
        $btnReset = null,
        $btnCrop = null,
        $resultContainer = null,
        $inputCropInfo = null,
        imageOptions = {},
        variants = [
            {
                width: 200,
                height: 200,
                minWidth: 200,
                minHeight: 200,
                maxWidth: 350,
                maxHeight: 350
            }
        ];
    // public methods
    var methods = {
            init: function(options) {
                $th = $(this);
                // merge options
                variants = options.variants || variants; 
                $inputFile = $(options.selectors.inputFile);
                $inputCropInfo = $(options.selectors.inputCropInfo);   
                $btnReset = $(options.selectors.btnReset);
                $btnCrop = $(options.selectors.btnCrop);
                $resultContainer = $(options.selectors.resultContainer);
                imageOptions = options.imageResultOptions || imageOptions;
                // initialize plugin
                $backupResultContainer = $resultContainer.clone();
                initComponents();
                initEvents();
            }
        };
    // protected methods
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
            // select image from file
            $inputFile.on(EVENT_CHANGE, selectFromFile);
            // crop image
            $btnCrop.on(EVENT_CLICK, cropImage);
            // reset button
            $btnReset.on(EVENT_CLICK, reset);
        },
        selectFromFile = function() {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(this.files[0]);
            $(fileReader).one(EVENT_LOAD, loadImage);
        },
        cropImage = function() {
            var x = $frame.position().left - $image.position().left,
                y = $frame.position().top - $image.position().top,
                canvas = $('<canvas/>').attr({width: $frame.width(), height: $frame.height()})[0];
                canvas
                .getContext('2d')
                .drawImage(
                    $image[0], 
                    0, 
                    0,  
                    sourceImage.width, 
                    sourceImage.height,
                    -x,
                    -y,
                    $image.width(),
                    $image.height()
                );
            var dImage = canvas.toDataURL('image/png');
            addCropInfo({
                sWidth: sourceImage.width,
                sHeight: sourceImage.height,
                x: x,
                y: y,
                dWidth: $image.width(),
                dHeight: $image.height(),
                ratio: ratio,
                dImage: dImage
            });
            $resultContainer.append(
                $(
                    '<img>', 
                    $.extend(imageOptions, {
                        src: dImage
                    })
                )
            );
        },
        initFrame = function() {
            var variant = getCurrentVariant(),
                left = $workarea.width() / 2 - variant.width / 2,
                top = $workarea.height() / 2 - variant.height / 2;
            $frame.css({
                width: variant.width,
                height: variant.height,
                backgroundImage: 'url("' + sourceImage.src + '")'
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
                frameTop = $frame.position().top,
                variant = getCurrentVariant();
            if (width > variant.maxWidth) {
                width = variant.maxWidth;
            } else if (width < variant.minWidth) {
                width = variant.minWidth;
            }
            if (height > variant.maxHeight) {
                height = variant.maxHeight;
            } else if (height < variant.minHeight) {
                height = variant.minHeight;
            }
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
                $image.one(EVENT_LOAD, start);
                $image.attr('src', this.src);
            });
            sourceImage.src = event.target.result;
        },
        resizeWorkarea = function() { 
            initRatio();
            var left = $image.width() / 2 - $workarea.width() / 2,
                top = $image.height() / 2 - $workarea.height() / 2;
            refrashImage(-left, -top);           
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
        initRatio = function() {
            var variant = getCurrentVariant();
            if (variant.width > sourceImage.width || variant.height > sourceImage.height) {
                var wRatio = variant.width / sourceImage.width,
                    hRatio = variant.height / sourceImage.height;
                if (wRatio > hRatio) {
                    ratio = wRatio;
                } else {
                    ratio = hRatio;
                }
            } else {
                ratio = 1;
            }
            zoom(sourceImage.width * ratio, sourceImage.height * ratio);
        },
        showWorkarea = function() {
            $workarea.fadeIn();
        },
        hideWorkarea = function() {
            $workarea.fadeOut();
        },
        resetVariant = function() {
            indexVariant = 0;
        },
        getCurrentVariant = function() {
            return variants[indexVariant];
        },
        setCropInfo = function(value) {
            $inputCropInfo.val(JSON.stringify(value));
        },
        addCropInfo = function(value) {
            var data = JSON.parse($inputCropInfo.val());
            data.push(value);
            $inputCropInfo.val(JSON.stringify(data));
        },
        reset = function() {
            $resultContainer.html($backupResultContainer.html());
            $inputCropInfo.val([]);
            resetVariant();
            hideWorkarea();
        },
        start = function() {
            $resultContainer.empty();
            setCropInfo([]);
            resetVariant();
            showWorkarea();
            initRatio();
            var left = $image.width() / 2 - $workarea.width() / 2,
                top = $image.height() / 2 - $workarea.height() / 2;                   
            refrashImage(-left, -top); 
            initFrame();
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
