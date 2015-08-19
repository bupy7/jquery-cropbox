# jquery-cropbox

A Cropper image writing at jQuery.

This Cropper can resize, zoom, move image before crop.

# Demo

[jQuery-Cropbox Demo](http://bupy7.github.io/jquery-cropbox/)

# Install via Bower

```
bower install jq-cropbox#1.0.*
```

# Documentation

[Wiki](https://github.com/bupy7/jquery-cropbox/wiki/)

# Usage

Include:

```html
<link href="/PATH_TO_BOWER/jq-cropbox/dist/jquery.cropbox.min.css" rel="stylesheet">
<script src="/PATH_TO_BOWER/jquery/dist/jquery.min.js"></script>
<script src="/PATH_TO_BOWER/jquery-mousewheel/jquery.mousewheel.min.js"></script>
<script type="text/javascript">/PATH_TO_BOWER/jq-cropbox/dist/jquery.cropbox.min.js</script>
```

Create a skeleton:

```html
<p id="message"></p> 
<div id="plugin" class="cropbox">
    <div class="workarea-cropbox">
        <div class="bg-cropbox">
            <img class="image-cropbox">
            <div class="membrane-cropbox"></div>
        </div>
        <div class="frame-cropbox">
            <div class="resize-cropbox"></div>
        </div>
    </div>
    <p>
        <input type="file" accept="image/*">
        <button type="button" class="btn-crop">Crop</button>
        <button type="button" class="btn-reset">Reset</button>
    </p>
    <div class="cropped"></div>
    <textarea class="data"></textarea>
</div>
```

Registration of plugin:

```js
$('#plugin').cropbox({
    selectors: {
        inputInfo: '#plugin textarea.data',
        inputFile: '#plugin input[type="file"]',
        btnCrop: '#plugin .btn-crop',
        btnReset: '#plugin .btn-reset',
        resultContainer: '#plugin .cropped',
        messageBlock: '#message'
    },
    imageOptions: {
        style: 'margin-right: 5px; margin-bottom: 5px'
    },
    variants: [
        {
            width: 200,
            height: 200,
            minWidth: 180,
            minHeight: 200,
            maxWidth: 350,
            maxHeight: 350
        },
        {
            width: 150,
            height: 200
        }
    ],
    messages: [
        'Crop a middle image.',
        'Crop a small image.'
    ]
});
```

# Wrappers

- [Yii2](https://github.com/bupy7/yii2-widget-cropbox)

# License

yii2-widget-cropbox is released under the BSD 3-Clause License.