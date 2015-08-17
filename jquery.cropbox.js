/**
 * Cropbox module of jQuery. A lightweight and simple plugin to crop your image. 
 * 
 * Belosludcev Vasilij https://github.com/bupy7
 * Homepage: https://github.com/bupy7/jquery-cropbox
 * v1.0.0
 */
"use strict";
(function ($) {
    var $th = null,
        $cropInfoInput = null,
        $frame = null,
        $image = null,
        $workarea = null,
        $membrane = null,
        $btnReset = null,
        $btnCrop = null,
        $file = null,
        frameState = {},
        imageState = {},
        sourceImage = new Image,
        ratio = 1,
        variants = [
            {
                width: 200,
                height: 200
            }
        ],
        indexVariant = 0,
        methods = {
            init: function(options) {
                $th = $(this); 
                variants = options.variants || variants;
                $cropInfoInput = $th.find(options.cropInfoSelector);   
                $btnReset = $th.find(options.btnResetSelector);
                $btnCrop = $th.find(options.btnCropSelector);
                initComponents();
                initEvents();
            }
        },
        initComponents = function() {
            $image = $th.find('.image-cropbox');
            $frame = $th.find('.frame-cropbox');
            $workarea = $th.find('.workarea-cropbox');
            $membrane = $th.find('.membrane-cropbox');
            $file = $th.find('input[type="file"]');
        },
        initEvents = function() {
            $frame.on('mousedown', frameMouseDown);
            $frame.on('mousemove', frameMouseMove);
            $frame.on('mouseup', frameMouseUp);

            $membrane.on('mousedown', imageMouseDown);
            $membrane.on('mousemove', imageMouseMove);
            $membrane.on('mouseup', imageMouseUp);
            $membrane.on('mousewheel', imageMouseWheel);

            $(window).on('resize', resizeWorkarea);
            
            $file.on('change', function() {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(this.files[0]);
                $(fileReader).one('load', loadImage);
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
            refrashFrame(left, top);    
        },
        refrashFrame = function(left, top) {
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
        frameMouseDown = function(event) {
            event.stopImmediatePropagation();    

            frameState.dragable = true;
            frameState.mouseX = event.clientX;
            frameState.mouseY = event.clientY;
        },
        frameMouseMove = function(event) {
            event.stopImmediatePropagation();

            if (frameState.dragable) {
                var xOld = $frame.css('left'),
                    yOld = $frame.css('top'),
                    left = event.clientX - frameState.mouseX + parseInt(xOld),
                    top = event.clientY - frameState.mouseY + parseInt(yOld);

                frameState.mouseX = event.clientX;
                frameState.mouseY = event.clientY;
                refrashFrame(left, top);
            }
        },
        frameMouseUp = function(event) {
            event.stopImmediatePropagation();    

            frameState.dragable = false;
        },
        imageMouseDown = function(event) {
            event.stopImmediatePropagation();    

            imageState.dragable = true;
            imageState.mouseX = event.clientX;
            imageState.mouseY = event.clientY;
        },
        imageMouseMove = function(event) {
            event.stopImmediatePropagation();

            if (imageState.dragable) {
                var xOld = $image.css('left'),
                    yOld = $image.css('top'),
                    left = event.clientX - imageState.mouseX + parseInt(xOld),
                    top = event.clientY - imageState.mouseY + parseInt(yOld);

                imageState.mouseX = event.clientX;
                imageState.mouseY = event.clientY;
                refrashImage(left, top);

                frameState.mouseX = event.clientX;
                frameState.mouseY = event.clientY;
                refrashFrame(parseInt($frame.css('left')), parseInt($frame.css('top')));
            }
        },
        imageMouseUp = function(event) {
            event.stopImmediatePropagation();    

            imageState.dragable = false;
        },
        refrashImage = function(left, top) {
            $image.css({left: left, top: top});
        },
        loadImage = function(event) {
            $(sourceImage).one('load', function() {
                $image.one('load', function() {
                    refrashImage('auto', 'auto');
                    initFrame();  
                });
                $image.attr('src', this.src);
            });
            sourceImage.src = event.target.result;
        },
        resizeWorkarea = function() { 
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
            refrashFrame(parseInt($frame.css('left')), parseInt($frame.css('top')));
        },
        zoomOut = function() {
            var oldRatio = ratio;
            ratio *= 0.99;
            var width = sourceImage.width * ratio,
                height = sourceImage.height * ratio;
            if (width >= $frame.width() && height >= $frame.height()) {
                zoom(width, height);
                refrashFrame(parseInt($frame.css('left')), parseInt($frame.css('top')));
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
