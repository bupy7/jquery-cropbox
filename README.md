# jquery-cropbox

A Cropper image writing at jQuery.

This Cropper can resize, zoom, move image before crop.

## Wrappers

- [Yii2](https://github.com/bupy7/yii2-widget-cropbox)

## Demo

[jQuery-Cropbox Demo](http://bupy7.github.io/jquery-cropbox/)

## Install via Bower

```
bower install jq-cropbox#1.0.*
```

## Requirements

- [jQuery](https://github.com/jquery/jquery) >= 1.8
- [jquery-mousewheel](https://github.com/jquery/jquery-mousewheel)

## Usage

Include:

```html
<link href="/PATH_TO_BOWER/jq-cropbox/dist/jquery.cropbox.min.css" rel="stylesheet">
<script type="text/javascript" src="/PATH_TO_BOWER/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="/PATH_TO_BOWER/jquery-mousewheel/jquery.mousewheel.min.js"></script>
<script type="text/javascript" src="/PATH_TO_BOWER/jq-cropbox/dist/jquery.cropbox.min.js"></script>
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

## Options

### ```selectors``` (required)

Selectors is required property where must be content:

**Required:**
- ```inputInfo``` - Selector to input type "text"/"textarea" where will be write information about cropped.
- ```inputFile``` - Selector to input type "file" for select image from file.
- ```btnCrop``` - Selector to button for run crop action.
- ```btnReset``` - Selector to button for run reset action.
- ```resultContainer``` - Content cropped images.

**Additional:**
- ```messageBlock``` - If you set property ```messages``` then you must be set selector for display it messages.

### ```variants``` (required)

Variants of crop image. Supported few crop settings.

By default variants content following settings:

```js
variants = [
    {
        width: 200,
        height: 200,
        minWidth: 200,
        minHeight: 200,
        maxWidth: 350,
        maxHeight: 350
    }
]
``` 

You can set your settings of frame crop.

**Required:**
- ```width``` - Width of frame crop (px).
- ```height```  - Height of frame crop (px).

**Additional:**
- ```minWidth``` - Minimal width of frame crop for resize it (px).
- ```maxWidth``` - Maximum width of frame crop for resize it (px).
- ```minHeight``` - Minimal height of frame crop for resize it (px).
- ```maxHeight``` - Maximum height of frame crop for resize it (px).

You can set both or one options max(min)Width/max(min)Height of resize frame crop. 

### ```imageOptions```

HTML-attributes for cropped images which content to ```resultContainer```.

### ```messages```

Text/Html messages for current frame crop settings.

## License

yii2-widget-cropbox is released under the BSD 3-Clause License.