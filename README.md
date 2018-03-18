# awezoom

Another CSS3 transition zooming library with the benefit of native scrollbars, focal points and adjustable content alignment. 

## Demo
[Demo](https://johannulbrich.github.io/awezoom/)

Click to zoom to a certain point (left click = zoom in, right click = zoom out). 

## Installing

### Download
[Download awezoom](https://github.com/JohannUlbrich/awezoom/archive/master.zip) or run `bower install awezoom`.

### Add files
Just add the script file to your application.

```html
<script src="awezoom.js"></script>
```

## Usage
Create a container element and place your content inside.

```html
<div id="zoom-container">
    <!-- Place your content here -->
    <div>This is my awesome content.</div>
</div>
```

```js
// Initialize with selector string and default settings
new Awezoom('#zoom-container');
```

```js
// Initialize with DOM node and default settings
var zoomContainer = document.getElementByIs('zoom-container');

new Awezoom(zoomContainer);
```

### Initialize with custom settings

```js
// Initialize with custom settings
var myAwezoomInstance = new Awezoom('#zoom-container', {
    // Initial zoom level
    zoomLevel: 1,

    // Minimum level to zoom
    minZoomLevel: 0.125,

    // Maximum level to zoom
    maxZoomLevel: 32,

    // Default factor to zoom in or out
    zoomFactor: 2,

    // Alignment of the content if it is smaller than the zoom container
    alignment: {
        horizontal: 'left', // left, center, right
        vertical: 'top' // top, center, bottom
    }

    // CSS transition-timing-function
    zoomEasing: 'ease-in-out',

    // CSS transition-duration in milliseconds
    zoomDuration: 300,

    // Default point to zoom in or out
    focalPoint: {
        x: 0,
        y: 0
    }
});
```

## Release Notes

### 1.0.0

* 

### 0.2.5

* Add support for pinch to zoom
* Fix wrong CSS vendor prefixes 

### 0.2.4

* Fix wrong focal point position when zoom container isn't aligned left and top.

### 0.2.2

* Improve performance.
* Add support for pinch to zoom.

### 0.2.1

* Auto wrap content elements. It's no longer necessary to wrap your content. 

### 0.2.0

* Remove `selector` property from settings object. Now you have to initialize the awezoom instance by passing in a selector string or a DOM node as the first parameter. 

## License
See the [LICENSE](https://github.com/JohannUlbrich/awezoom/blob/master/LICENSE) file.

