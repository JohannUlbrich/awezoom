# awezoom

Awesome library to zoom images or every other content you want. In difference to all other zooming libs your zoom container have scrollbars.

## Demo


## Installing

### Download
[Download awezoom](https://github.com/JohannUlbrich/awezoom/archive/master.zip) or run `bower install awezoom`.

### Add files
Just add the script file to your application.

```html
<script src="awezoom.js"></script>
```

## Usage
Create a container element and place your content inside. But just add one child. If you have multiple elements, you have to wrap it.

```html
<div id="zoom-container">
    <!-- Place your content here -->
    <div>This is my awesome content.</div>
</div>
```

```js
// Initialize with default settings
new Awezoom('#zoom-container');
```

## Initialization

```js
// Initialize with custom settings
var myAwezoomInstance = new Awezoom({
    // Selector of the zoom container element
    selector: '',

    // Initial zoom level
    zoomLevel: 1,

    // Minimum level to zoom
    minZoomLevel: 0.125,

    // Maximum level to zoom
    maxZoomLevel: 32,

    // Default factor to zoom in or out
    zoomFactor: 2,

    // Horizontal and vertical alignment of the content if it is smaller than the zoom container
    // the first value is the horizontal position (left, center, right)
    // and the second value is the vertical (top, center, bottom)
    alignment: 'center center',

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

## License
See the [LICENSE](https://github.com/JohannUlbrich/awezoom/blob/master/LICENSE) file.

