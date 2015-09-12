/**
 * jQuery-Cropbox. 
 * A lightweight and simple plugin to crop your image. 
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
 * v1.0.1
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
        $inputInfo = null,
        $messageBlock = null,
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
        ],
        messages = [];
    // public methods
    var methods = {
            init: function(options) {
                $th = $(this);
                // merge options
                $inputFile = $(options.selectors.inputFile);
                $inputInfo = $(options.selectors.inputInfo);   
                $btnReset = $(options.selectors.btnReset);
                $btnCrop = $(options.selectors.btnCrop);
                $resultContainer = $(options.selectors.resultContainer);
                variants = options.variants || variants; 
                imageOptions = options.imageOptions || imageOptions;
                messages = options.messages || messages;
                if (typeof options.selectors.messageBlock != 'undefined') {
                    $messageBlock = $(options.selectors.messageBlock);
                }
                // initialize plugin
                initResultBackup();
                initComponents();
                disableControls();
                hideMessage();
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
                frameWidth = $frame.width(),
                frameHeight = $frame.height(),
                canvas = $('<canvas/>').attr({width: frameWidth, height: frameHeight})[0],
                image = null;
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
            image = canvas.toDataURL('image/png');
            addInfo({
                sWidth: sourceImage.width,
                sHeight: sourceImage.height,
                x: x,
                y: y,
                dWidth: $image.width(),
                dHeight: $image.height(),
                ratio: ratio,
                width: frameWidth,
                height: frameHeight,
                image: image
            });
            addToContainer($('<img>', $.extend(imageOptions, {src: image})));
            if (nextVariant()) {
                nextMessage();
            }
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
                frameWidth = $frame.width(),
                frameHeight = $frame.height(),
                variant = getCurrentVariant(),
                maxWidth = variant.maxWidth,
                maxHeight = variant.maxHeight,
                minWidth = variant.minWidth,
                minHeight = variant.minHeight;
            // set max width and min width
            if (width > frameWidth && typeof maxWidth == 'undefined') {
                maxWidth = frameWidth;
            } else if (width < frameWidth && typeof minWidth == 'undefined') {
                minWidth = frameWidth;
            }
            if (height > frameHeight && typeof maxHeight == 'undefined') {
                maxHeight = frameHeight;
            } else if (height < frameHeight && typeof minHeight == 'undefined') {
                minHeight = frameHeight;
            }
            // check max and min width
            if (width > maxWidth) {
                width = maxWidth;
            } else if (width < minWidth) {
                width = minWidth;
            }
            if ($image.width() + imgLeft < frameLeft + width) {
                width = $image.width() + imgLeft - frameLeft;
            }
            // check max and min height
            if (height > maxHeight) {
                height = maxHeight;
            } else if (height < minHeight) {
                height = minHeight;
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
        frameMouseUp = function(event) {
            event.preventDefault();
            event.stopPropagation();

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
            event.preventDefault();
            event.stopPropagation();

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
        imageMouseUp = function(event) {
            event.preventDefault();
            event.stopPropagation();

            imageState.dragable = false;
        },
        refrashImage = function(left, top) {
            $image.css({left: left, top: top});
        },
        initImage = function() {
            var left = $image.width() / 2 - $workarea.width() / 2,
                top = $image.height() / 2 - $workarea.height() / 2;                   
            refrashImage(-left, -top); 
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
            initImage();
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
        nextVariant = function() {
            if (variants.length <= indexVariant + 1) {
                indexVariant = 0;
                stop();
                return false;
            }
            ++indexVariant;
            initRatio();
            initImage();
            initFrame();
            return true;
        },
        setInfo = function(value) {
            $inputInfo.val(JSON.stringify(value));
        },
        addInfo = function(value) {
            var data = JSON.parse($inputInfo.val());
            data.push(value);
            $inputInfo.val(JSON.stringify(data));
        },
        reset = function() {
            resultFromBackup();
            setInfo([]);
            resetVariant();
            hideWorkarea();
            disableControls();
            hideMessage();
        },
        start = function() {
            emptyResultContainer();
            setInfo([]);
            resetVariant();
            showWorkarea();
            initRatio();                   
            initImage(); 
            initFrame();
            enableControls();
            showMessage();
        },
        stop = function() {
            hideWorkarea();
            disableControls();
            hideMessage();
        },
        disableControls = function() {
            $btnCrop.prop('disabled', true);
        },
        enableControls = function() {
            $btnCrop.prop('disabled', false);
        },
        nextMessage = function() {
            if (!showMessage()) {
                hideMessage();
            }
        },
        showMessage = function() {
            if (typeof messages[indexVariant] != 'undefined' && $messageBlock !== null) {
                $messageBlock.html(messages[indexVariant]).show();
                return true;
            }
            return false;
        },
        hideMessage = function() {
            if ($messageBlock !== null) {
                $messageBlock.hide();
            }
        },
        initResultBackup = function() {
            $backupResultContainer = $resultContainer.clone();
        },
        resultFromBackup = function() {
            $resultContainer.html($backupResultContainer.html());
        },
        addToContainer = function(content) {
            $resultContainer.append(content);  
        },
        emptyResultContainer = function() {
            $resultContainer.empty();
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
