/**
 * 
 */

(function(root, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define([], factory);

    // Node
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();

    // Browser globals
    } else {
        root.Awezoom = factory();
    }
}(this, function() {
    'use strict';

    // requestAnimationFrame polyfill
    // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    var _getTransitionEndEvent = function() {
        var element = document.createElement('div');
        var transitions = {
            'transition': 'transitionend',
            'oTransition': 'oTransitionEnd',
            'mozTransition': 'transitionend',
            'webkitTransition': 'webkitTransitionEnd'
        };

        for (var transition in transitions) {
            if (element.style[transition] !== undefined) {
                return transitions[transition];
            }
        }
    };

    // TODO: cache prefixes and fix uppercase style issue
    var _setCSSStyles = function(element, styles) {
        var vendorPrefixes = ['', 'webkit', 'Moz', 'ms', 'O'];

        for (var style in styles) {
            for (var prop in vendorPrefixes) {
                if (element.style[vendorPrefixes[prop] + style] !== undefined) {
                    element.style[vendorPrefixes[prop] + style] = styles[style];
                    break;
                }
            }
        }
    };

    var _deepExtend = function(target, source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (target[prop] && typeof source[prop] === 'object') {
                    deepObjectExtend(target[prop], source[prop]);
                } else {
                    target[prop] = source[prop] || target[prop];
                }
            }
        }

        return target;
    };

    var _valueBetween = function(value, min, max) {
        return (Math.min(max, Math.max(min, value)));
    };

    var Awezoom = function(element, settings) {
        var that = this;

        // Default settings
        this.settings = {
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
            zoomDuration: '300ms',

            // Default point to zoom in or out
            focalPoint: {
                x: 0,
                y: 0
            }

            // onInit: function() {},
            // onDestroy: function() {},
            // beforeZoom: function() {},
            // afterZoom: function() {}
        };

        var zoomContainerElement;

        // Get zoom container element
        if (typeof element === 'string') {
            zoomContainerElement = zoomContainerElement = document.querySelector(element);
        } else if (element.nodeType && element.nodeType === 1) {
            zoomContainerElement = element;
        }

        // Ensure that the zoom container exist
        if (!zoomContainerElement) {
            return;
        }

        // Parse settings
        if (settings && typeof settings === 'object') {
            this.settings = _deepExtend(this.settings, settings);
        }

        var children = zoomContainerElement.children;

        // Wrap content if there is more than one child
        if (children.length > 1) {
            zoomContainerElement.innerHTML = '<div>' + zoomContainerElement.innerHTML + '</div>';
        }

        // Get zoom content element
        var zoomContentElement = children[0];

        // Add a placeholder element
        var placeholderElement = document.createElement('div');
        zoomContainerElement.appendChild(placeholderElement);

        // Place content into placeholder
        placeholderElement.appendChild(zoomContentElement);

        // Add CSS
        _setCSSStyles(zoomContainerElement, {
            'overflow': 'scroll',
            'position': 'relative'
        });
        _setCSSStyles(placeholderElement, {
            'position': 'absolute',
            'overflow': 'hidden'
        });
        _setCSSStyles(zoomContentElement, {
            'position': 'absolute',
            'transformOrigin': '0 0 0',
            'transitionProperty': 'transform',
            'willChange': 'transform'
        });

        // Parse alignment settings
        var alignmentSettings = this.settings.alignment.split(' ');

        // Create internal state of this instance
        this._state = {
            zoomContainerElement: zoomContainerElement,
            zoomContentElement: zoomContentElement,
            placeholderElement: placeholderElement,
            isZooming: false,
            zoomLevel: this.settings.zoomLevel,
            contentOffset: {
                x: 0,
                y: 0
            },
            alignment: {
                horizontal: alignmentSettings[0],
                vertical: alignmentSettings[1]
            },
            transitionEndEvent: _getTransitionEndEvent()
        };

        // Add a resize event listener
        var resizeListener = (function() {
            var running = false;

            window.addEventListener('resize', function resize(event) {
                if (!running) {
                    running = true;

                    window.requestAnimationFrame(function() {
                        // Reposition on resize
                        that.position();

                        running = false;
                    });
                }
            });
        }());

        // Set initial zoom level and position
        this.zoom(this._state.zoomLevel, {
            x: 0,
            y: 0
        }, 0);
    };

    Awezoom.prototype.zoom = function(zoomLevel, focalPoint, zoomDuration, zoomEasing) {
        if (this._state.isZooming) {
            return;
        }

        if (zoomLevel < this.settings.minZoomLevel || zoomLevel > this.settings.maxZoomLevel) {
            return;
        }

        this._state.isZooming = true;

        this._cacheState();

        zoomLevel = zoomLevel || this.settings.zoomLevel;
        focalPoint = focalPoint || this.settings.focalPoint;
        zoomEasing = zoomEasing || this.settings.zoomEasing;
        zoomDuration = zoomDuration || this.settings.zoomDuration;

        var transitionEndEvent;

        // Function to call after transition has ended
        var afterTransition = (function() {
            // Reinsert content 
            _setCSSStyles(this._state.zoomContentElement, {
                'transitionDuration': '',
                'transitionTimingFunction': '',
                'transformOrigin': '0 0 0',
                'transform': 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + contentOffsetAfterZooming.x + ', ' + contentOffsetAfterZooming.y + ')'
            });

            // On zoom out resize placeholder and scroll after transition
            if (zoomLevel <= currentZoomLevel) {
                _setCSSStyles(this._state.placeholderElement, {
                    'width': (zoomedContentSize.width + contentOffsetAfterZooming.x) + 'px',
                    'height': (zoomedContentSize.height + contentOffsetAfterZooming.y) + 'px'
                });

                this._setScrollPosition(newScrollPosition);
            }

            if (zoomedContentSize.width === 0 && zoomedContentSize.height === 0) {
                _setCSSStyles(this._state.placeholderElement, {
                    'width': '',
                    'height': ''
                });
            }

            // Remove event listener
            if (transitionEndEvent) {
                this._state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
            }

            // Update states
            this._state.zoomLevel = zoomLevel;
            this._state.contentOffset = contentOffsetAfterZooming;

            this._clearState();

            this._state.isZooming = false;
        }).bind(this);

        // Subtract container position from focal point
        var zoomContainerElementBoundingRect = this._state.zoomContainerElement.getBoundingClientRect();
        focalPoint.x -= zoomContainerElementBoundingRect.left;
        focalPoint.y -= zoomContainerElementBoundingRect.top;

        var currentZoomLevel = this._state.zoomLevel;
        var currentContentOffset = this._state.contentOffset;
        var zoomedContentSize = this._getContentSize(zoomLevel);
        var transformOrigin = this._determineTransformOrigin(focalPoint, currentZoomLevel, zoomLevel);
        var contentOffsetAfterZooming = this._determineIntendedContentOffset(zoomLevel);

        // Calculate scroll position
        var zoomContainerSize = this._getZoomContainerSize();
        var focalPointInZoomedContent = this._findRawCoordinatesInZoomedContent(transformOrigin, zoomLevel);
        var viewportCoordinates = this._findRawCoordinatesInViewport(transformOrigin);
        var maxScrollPosition = {
            x: (zoomedContentSize.width - zoomContainerSize.width > 0) ? (zoomedContentSize.width - zoomContainerSize.width) : 0,
            y: (zoomedContentSize.height - zoomContainerSize.height > 0) ? (zoomedContentSize.height - zoomContainerSize.height) : 0
        };
        var newScrollPosition = {
            x: _valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
            y: _valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y)
        };

        // Calculate Offset
        var transformOffsetToCompensateOrigin = { // Compensate origin
            x: transformOrigin.x * currentZoomLevel - transformOrigin.x,
            y: transformOrigin.y * currentZoomLevel - transformOrigin.y
        };
        var transformOffset = {
            x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
            y: transformOffsetToCompensateOrigin.y + currentContentOffset.y
        };

        // On zoom in resize placeholder element to stretch content for scrolling
        if (zoomLevel > currentZoomLevel) {
            var currentScrollPosition = this._getScrollPosition();

            transformOffset.x += newScrollPosition.x - currentScrollPosition.x;
            transformOffset.y += newScrollPosition.y - currentScrollPosition.y;

            _setCSSStyles(this._state.placeholderElement, {
                'width': (zoomedContentSize.width + contentOffsetAfterZooming.x) + 'px',
                'height': (zoomedContentSize.height + contentOffsetAfterZooming.y) + 'px'
            });

            this._setScrollPosition(newScrollPosition);

        // On zoom out resize placeholder to remain content size until transition has ended
        } else {
            var currentContentSize = this._getContentSize(currentZoomLevel);

            _setCSSStyles(this._state.placeholderElement, {
                'width': (currentContentSize.width + currentContentOffset.x) + 'px',
                'height': (currentContentSize.height + currentContentOffset.y) + 'px'
            });
        }

        if (zoomDuration.replace(/[^\d\.,]/g,'') <= 0 || currentZoomLevel === zoomLevel) {
            // Call manually if there is no transition event
            afterTransition();
        } else {
            transitionEndEvent = this._state.transitionEndEvent;

            // Position content and set focal point
            _setCSSStyles(this._state.zoomContentElement, {
                'transitionDuration': '',
                'transitionTimingFunction': '',
                'transformOrigin': transformOrigin.x + 'px ' + transformOrigin.y + 'px 0',
                'transform': 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
            });

            // Trigger a reflow to set the transform matrix above before using a transition 
            var offsetHeight = this._state.zoomContentElement.offsetHeight;

            // Add event listener to execute afterTransition()
            this._state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);

            // Zoom the content
            _setCSSStyles(this._state.zoomContentElement, {
                'transitionDuration': zoomDuration,
                'transitionTimingFunction': zoomEasing,
                'transform': 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
            });
        }
    };

    Awezoom.prototype.pinchStart = function(focalPoint) {
        if(this._state.isPinching) {
            return;
        }
        
        this._state.isPinching = true;
        
        var currentZoomLevel = this._state.zoomLevel;
        var currentContentOffset = this._state.contentOffset;
        var transformOrigin = this._findViewportCoordinatesInRawContent(focalPoint);
        var transformOffsetToCompensateOrigin = { // Compensate origin
            x: transformOrigin.x * currentZoomLevel - transformOrigin.x,
            y: transformOrigin.y * currentZoomLevel - transformOrigin.y
        };
        var transformOffset = {
            x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
            y: transformOffsetToCompensateOrigin.y + currentContentOffset.y
        };
        
        
        
        var zoomContainerSize = this._getZoomContainerSize();
        var zoomedContentSize = this._getContentSize(currentZoomLevel);
        
        if(zoomContainerSize.width > zoomedContentSize.width) {
            _setCSSStyles(this._state.placeholderElement, {
                'width': '100%'
            });
        }
        
        if(zoomContainerSize.height > zoomedContentSize.height) {
            _setCSSStyles(this._state.placeholderElement, {
                'height': '100%'
            });
        }
        
        // Position content and set focal point
        _setCSSStyles(this._state.zoomContentElement, {
            'transitionDuration': '',
            'transitionTimingFunction': '',
            'transformOrigin': transformOrigin.x + 'px ' + transformOrigin.y + 'px 0',
            'transform': 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
        });
        
        this._state.lastFocalPoint = this._findRawCoordinatesInViewport(transformOrigin);
        this._state.lastOffset = transformOffset;
        this._state.lastOrigin = transformOrigin;
        this._state.lastZoomLevel = currentZoomLevel;
    };

    Awezoom.prototype.pinchMove = function(scale) {
        var zoomLevel = scale * this._state.zoomLevel;

        if (zoomLevel < this.settings.minZoomLevel || zoomLevel > this.settings.maxZoomLevel) {
            return;
        }
        
        // Zoom
        _setCSSStyles(this._state.zoomContentElement, {
            'transform': 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + this._state.lastOffset.x + ', ' + this._state.lastOffset.y + ')'
        });
        
        this._state.lastPinchZoomLevel = zoomLevel;
    };

    Awezoom.prototype.pinchEnd = function() {
        if(!this._state.isPinching) {
            return;
        }
        
        // Function to call after transition has ended
        var afterTransition = (function() {
            // Reinsert content 
            _setCSSStyles(this._state.zoomContentElement, {
                'transitionDuration': '',
                'transitionTimingFunction': '',
                'transformOrigin': '0 0 0',
                'transform': 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + contentOffsetAfterZooming.x + ', ' + contentOffsetAfterZooming.y + ')'
            });

            _setCSSStyles(this._state.placeholderElement, {
                'width': (zoomedContentSize.width + contentOffsetAfterZooming.x) + 'px',
                'height': (zoomedContentSize.height + contentOffsetAfterZooming.y) + 'px'
            });

            this._setScrollPosition(newScrollPosition);

            // Remove event listener
            if (transitionEndEvent) {
                this._state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
            }
            
            // Update states
            this._state.zoomLevel = zoomLevel;
            this._state.contentOffset = contentOffsetAfterZooming;
            
            this._state.lastFocalPoint = null;
            this._state.lastOffset = null;
            this._state.lastOrigin = null;
            this._state.lastZoomLevel = null;
            this._state.lastPinchZoomLevel = null;
            
            this._state.isPinching = false;
        }).bind(this);
        
        var zoomEasing = this.settings.zoomEasing;
        var zoomDuration = this.settings.zoomDuration;
        
        var zoomLevel = this._state.lastPinchZoomLevel;

        // Calculate Offset
        var zoomContainerSize = this._getZoomContainerSize();
        var zoomedContentSize = this._getContentSize(zoomLevel);
        var contentOffsetAfterZooming = this._determineIntendedContentOffset(zoomLevel);
        var contentMarginAfterZooming = this._determineContentMargin(zoomLevel, this._state.lastFocalPoint);
        var transformOffset = {
            x: this._state.lastOffset.x,
            y: this._state.lastOffset.y,
        };
        
        if(zoomedContentSize.width > zoomContainerSize.width) {
            transformOffset.x -= contentMarginAfterZooming.left > 0 ? contentMarginAfterZooming.left : 0;
            transformOffset.x += contentMarginAfterZooming.right > 0 ? contentMarginAfterZooming.right : 0;
        } else {
            transformOffset.x += (contentOffsetAfterZooming.x - contentMarginAfterZooming.left);
        }
        
        if(zoomedContentSize.height > zoomContainerSize.height) {
            transformOffset.y -= contentMarginAfterZooming.top > 0 ? contentMarginAfterZooming.top : 0;
            transformOffset.y += contentMarginAfterZooming.bottom > 0 ? contentMarginAfterZooming.bottom : 0;
        } else {
            transformOffset.y += (contentOffsetAfterZooming.y - contentMarginAfterZooming.top);
        }
        
        // Trigger a reflow to set the transform matrix above before using a transition 
        //var offsetHeight = this._state.zoomContentElement.offsetHeight;
        
        // Calculate scroll position
        var focalPointInZoomedContent = this._findRawCoordinatesInZoomedContent(this._state.lastOrigin, zoomLevel);
        var viewportCoordinates = this._state.lastFocalPoint;
        var maxScrollPosition = {
            x: (zoomedContentSize.width - zoomContainerSize.width > 0) ? (zoomedContentSize.width - zoomContainerSize.width) : 0,
            y: (zoomedContentSize.height - zoomContainerSize.height > 0) ? (zoomedContentSize.height - zoomContainerSize.height) : 0
        };
        var newScrollPosition = {
            x: _valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
            y: _valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y)
        };
        
        if(this._state.lastOffset.x !== transformOffset.x || this._state.lastOffset.y !== transformOffset.y) {
            var transitionEndEvent = this._state.transitionEndEvent;
            
            // Add event listener to execute afterTransition()
            this._state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);
            
            // Move to correct position
            _setCSSStyles(this._state.zoomContentElement, {
                'transitionDuration': zoomDuration,
                'transitionTimingFunction': zoomEasing,
                'transform': 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
            });
        } else {
            afterTransition();
        }
    };

    Awezoom.prototype.zoomIn = function(focalPoint, zoomDuration, zoomEasing) {
        this.zoom(this._state.zoomLevel * this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
    };

    Awezoom.prototype.zoomOut = function(focalPoint, zoomDuration, zoomEasing) {
        this.zoom(this._state.zoomLevel / this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
    };

    Awezoom.prototype.zoomToFit = function(zoomDuration, zoomEasing) {
        var zoomContainerSize = this._getZoomContainerSize();
        var contentSize = this._getContentSize();
        var widthFactor = zoomContainerSize.width / contentSize.width;
        var heightFactor = zoomContainerSize.height / contentSize.height;
        var zoomLevel;

        if (widthFactor < heightFactor) {
            zoomLevel = widthFactor;
        } else {
            zoomLevel = heightFactor;
        }

        this.zoom(zoomLevel, null, zoomDuration, zoomEasing);
    };

    Awezoom.prototype.getZoomContainerElement = function() {
        return this._state.zoomContainerElement;
    };

    Awezoom.prototype.position = function(zoomDuration, zoomEasing) {
        var currentZoomLevel = this._state.zoomLevel;
        var currentContentSize = this._getContentSize(currentZoomLevel);
        var contentOffset = this._determineIntendedContentOffset(currentZoomLevel);

        zoomDuration = zoomDuration || this.settings.zoomDuration;
        zoomEasing = zoomEasing || this.settings.zoomEasing;

        _setCSSStyles(this._state.zoomContentElement, {
            'transitionDuration': zoomDuration,
            'transitionTimingFunction': zoomEasing,
            'transformOrigin': '0 0 0',
            'transform': 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + contentOffset.x + ', ' + contentOffset.y + ')'
        });

        if (currentContentSize.width === 0 && currentContentSize.height === 0) {
            _setCSSStyles(this._state.placeholderElement, {
                'width': '',
                'height': ''
            });

            return;
        }

        _setCSSStyles(this._state.placeholderElement, {
            'width': (currentContentSize.width + contentOffset.x) + 'px',
            'height': (currentContentSize.height + contentOffset.y) + 'px'
        });

        this._state.contentOffset = contentOffset;
    };

    Awezoom.prototype._getZoomContainerSize = function() {
        if(this._temp && this._temp.zoomContainerSize) {
            return this._temp.zoomContainerSize;
        }

        var element = this._state.zoomContainerElement;

        // the inner size of an element including the padding
        return {
            width: element.clientWidth,
            height: element.clientHeight
        };
    };

    Awezoom.prototype._getContentSize = function(zoomLevel) {
        if(this._temp && this._temp.contentSize) {
            zoomLevel = zoomLevel || 1;

            return {
                width: this._temp.contentSize.width * zoomLevel,
                height: this._temp.contentSize.height * zoomLevel
            };
        }

        var element = this._state.zoomContentElement;

        // offsetWidth and offsetHeight is the size of an element including padding, borders and scrollbars
        // the size isn't affected by CSS transformations, so it returns the original size
        var unzoomedContentSize = {
            width: element.offsetWidth,
            height: element.offsetHeight
        };

        zoomLevel = zoomLevel || 1;

        return {
            width: unzoomedContentSize.width * zoomLevel,
            height: unzoomedContentSize.height * zoomLevel
        };
    };

    Awezoom.prototype._cacheState = function() {
        this._temp = {
            zoomContainerSize: this._getZoomContainerSize(),
            contentSize: this._getContentSize(),
            zoomLevel: this._state.zoomLevel,
            scrollPosition: this._getScrollPosition(),
            contentOffset: this._state.contentOffset
        };
    };

    Awezoom.prototype._clearState = function() {
        this._temp = null;
    };

    Awezoom.prototype._findViewportCoordinatesInRawContent = function(coordinates) {
        var currentScrollPosition = this._getScrollPosition();
        var contentOffset = this._state.contentOffset;
        var currentZoomLevel = this._state.zoomLevel;
        var unzoomedContentSize = this._getContentSize();

        var coordinatesInUnzoomedContent = {
            x: (coordinates.x + currentScrollPosition.x - contentOffset.x) / currentZoomLevel,
            y: (coordinates.y + currentScrollPosition.y - contentOffset.y) / currentZoomLevel
        };

        return {
            x: _valueBetween(coordinatesInUnzoomedContent.x, 0, unzoomedContentSize.width),
            y: _valueBetween(coordinatesInUnzoomedContent.y, 0, unzoomedContentSize.height)
        };
    };

    Awezoom.prototype._findRawCoordinatesInViewport = function(coordinates) {
        var currentZoomLevel = this._state.zoomLevel;
        var currentContentOffset = this._state.contentOffset;
        var currentScrollPosition = this._getScrollPosition();
        var zoomContainerElementBoundingRect = this._state.zoomContainerElement.getBoundingClientRect();

        return {
            x: (coordinates.x * currentZoomLevel) + currentContentOffset.x - currentScrollPosition.x,
            y: (coordinates.y * currentZoomLevel) + currentContentOffset.y - currentScrollPosition.y
        };
    };

    Awezoom.prototype._findRawCoordinatesInZoomedContent = function(coordinates, zoomLevel) {
        return {
            x: coordinates.x * zoomLevel,
            y: coordinates.y * zoomLevel
        };
    };

    Awezoom.prototype._getScrollPosition = function() {
        if(this._temp && this._temp.scrollPosition) {
            return this._temp.scrollPosition;
        }

        var element = this._state.zoomContainerElement;

        return {
            x: element.scrollLeft,
            y: element.scrollTop
        };
    };

    Awezoom.prototype._setScrollPosition = function(coordinates) {
        var element = this._state.zoomContainerElement;

        element.scrollLeft = coordinates.x;
        element.scrollTop = coordinates.y;
    };

    // Returns the offset to align the content within the zoom container
    // you can pass in a zoom level or use the current zoom level 
    Awezoom.prototype._determineIntendedContentOffset = function(zoomLevel) {
        zoomLevel = zoomLevel || this._state.zoomLevel;

        var zoomContainerSize = this._getZoomContainerSize();
        var zoomedContentSize = this._getContentSize(zoomLevel);
        var alignmentSettings = this._state.alignment;

        var availableSpace = {
            width: zoomContainerSize.width - zoomedContentSize.width,
            height: zoomContainerSize.height - zoomedContentSize.height
        };

        var contentOffset = {
            x: 0,
            y: 0
        };

        if (availableSpace.width > 0) {
            switch (alignmentSettings.horizontal) {
                case 'left':
                    contentOffset.x = 0;
                    break;
                case 'center':
                    contentOffset.x = availableSpace.width / 2;
                    break;
                case 'right':
                    contentOffset.x = availableSpace.width;
            }
        }

        if (availableSpace.height > 0) {
            switch (alignmentSettings.vertical) {
                case 'top':
                    contentOffset.y = 0;
                    break;
                case 'center':
                    contentOffset.y = availableSpace.height / 2;
                    break;
                case 'bottom':
                    contentOffset.y = availableSpace.height;
            }
        }

        return contentOffset;
    };

    Awezoom.prototype._determineContentMargin = function(zoomLevel, focalPoint) {
        var zoomContainerSize = this._getZoomContainerSize();
        var unzoomedContentSize = this._getContentSize();
        var zoomedContentSize = {
            width: unzoomedContentSize.width * zoomLevel,
            height: unzoomedContentSize.height * zoomLevel
        };

        var focalPointInUnzoomedContent = this._findViewportCoordinatesInRawContent(focalPoint);
        var focalPointInZoomedContent = this._findRawCoordinatesInZoomedContent(focalPointInUnzoomedContent, zoomLevel);

        var zoomContainerSizeAroundFocalPoint = {
            top: focalPoint.y,
            right: zoomContainerSize.width - focalPoint.x,
            bottom: zoomContainerSize.height - focalPoint.y,
            left: focalPoint.x
        };

        var contentSizeAroundFocalPointAfterZooming = {
            top: focalPointInZoomedContent.y,
            right: zoomedContentSize.width - focalPointInZoomedContent.x,
            bottom: zoomedContentSize.height - focalPointInZoomedContent.y,
            left: focalPointInZoomedContent.x
        };

        return {
            top: zoomContainerSizeAroundFocalPoint.top - contentSizeAroundFocalPointAfterZooming.top,
            right: zoomContainerSizeAroundFocalPoint.right - contentSizeAroundFocalPointAfterZooming.right,
            bottom: zoomContainerSizeAroundFocalPoint.bottom - contentSizeAroundFocalPointAfterZooming.bottom,
            left: zoomContainerSizeAroundFocalPoint.left - contentSizeAroundFocalPointAfterZooming.left
        };
    };

    Awezoom.prototype._determineTransformOrigin = function(focalPoint, currentZoomLevel, newZoomLevel) {
        var currentContentOffset = this._state.contentOffset;
        var unzoomedContentSize = this._getContentSize();
        var currentContentSize = {
            width: unzoomedContentSize.width * currentZoomLevel,
            height: unzoomedContentSize.height * currentZoomLevel
        };
        var zoomedContentSize = {
            width: unzoomedContentSize.width * newZoomLevel,
            height: unzoomedContentSize.height * newZoomLevel
        };
        var zoomContainerSize = this._getZoomContainerSize();
        var zoomFactor = newZoomLevel / currentZoomLevel;

        // Ensure that focal point isn't out of content
        focalPoint.x = _valueBetween(focalPoint.x, currentContentOffset.x, currentContentSize.width + currentContentOffset.x);
        focalPoint.y = _valueBetween(focalPoint.y, currentContentOffset.y, currentContentSize.height + currentContentOffset.y);

        var contentMarginAfterZooming = this._determineContentMargin(newZoomLevel, focalPoint);

        var transformOrigin = this._findViewportCoordinatesInRawContent(focalPoint);

        var alignmentSettings = this._state.alignment;

        // Position content when smaller than the zoom area
        // but just if the content size is smaller than the zoom container size, before and after transition
        if (currentContentSize.width < zoomContainerSize.width && zoomedContentSize.width < zoomContainerSize.width) {
            switch (alignmentSettings.horizontal) {
                case 'left':
                    transformOrigin.x = 0;
                    break;
                case 'center':
                    transformOrigin.x = unzoomedContentSize.width / 2;
                    break;
                case 'right':
                    transformOrigin.x = unzoomedContentSize.width;
            }

        // Adjust position on zoom out if the content size is bigger than the zoom container size, before and after transition 
        // and if there is a positive margin on just one side
        // or when the content size trespasses the zoom container size and if there is a positive margin on just one side
        } else if (zoomedContentSize.width >= zoomContainerSize.width) {
            if (contentMarginAfterZooming.right > 0) {
                transformOrigin.x -= contentMarginAfterZooming.right / (zoomFactor - 1) / currentZoomLevel;
            }

            if (contentMarginAfterZooming.left > 0) {
                transformOrigin.x += contentMarginAfterZooming.left / (zoomFactor - 1) / currentZoomLevel;
            }

        // Adjust position on zoom out when the content size trespasses the zoom container size
        } else if (currentContentSize.width >= zoomContainerSize.width && zoomedContentSize.width <= zoomContainerSize.width) {
            switch (alignmentSettings.horizontal) {
                case 'left':
                    transformOrigin.x += contentMarginAfterZooming.left / (zoomFactor - 1) / currentZoomLevel;
                    break;
                case 'center':
                    transformOrigin.x -= (contentMarginAfterZooming.right - contentMarginAfterZooming.left) / (zoomFactor - 1) / currentZoomLevel / 2;
                    break;
                case 'right':
                    transformOrigin.x -= contentMarginAfterZooming.right / (zoomFactor - 1) / currentZoomLevel;
            }
        }


        // Position content when smaller than the zoom area
        // but just if the content size is smaller than the zoom container size, before and after transition
        if (currentContentSize.height < zoomContainerSize.height && zoomedContentSize.height < zoomContainerSize.height) {
            switch (alignmentSettings.vertical) {
                case 'top':
                    transformOrigin.y = 0;
                    break;
                case 'center':
                    transformOrigin.y = unzoomedContentSize.height / 2;
                    break;
                case 'bottom':
                    transformOrigin.y = unzoomedContentSize.height;
            }

        // Adjust position on zoom out if the content size is bigger than the zoom container size, before and after transition 
        // and if there is a positive margin on just one side
        // or when the content size trespasses the zoom container size and if there is a positive margin on just one side
        } else if (zoomedContentSize.height >= zoomContainerSize.height) {
            if (contentMarginAfterZooming.bottom > 0) {
                transformOrigin.y -= contentMarginAfterZooming.bottom / (zoomFactor - 1) / currentZoomLevel;
            }

            if (contentMarginAfterZooming.top > 0) {
                transformOrigin.y += contentMarginAfterZooming.top / (zoomFactor - 1) / currentZoomLevel;
            }

        // Adjust position on zoom out when the content size trespasses the zoom container size
        } else if (currentContentSize.height >= zoomContainerSize.height && zoomedContentSize.height <= zoomContainerSize.height) {
            switch (alignmentSettings.vertical) {
                case 'top':
                    transformOrigin.y += contentMarginAfterZooming.top / (zoomFactor - 1) / currentZoomLevel;
                    break;
                case 'center':
                    transformOrigin.y -= (contentMarginAfterZooming.bottom - contentMarginAfterZooming.top) / (zoomFactor - 1) / currentZoomLevel / 2;
                    break;
                case 'bottom':
                    transformOrigin.y -= contentMarginAfterZooming.bottom / (zoomFactor - 1) / currentZoomLevel;
            }
        }

        return transformOrigin;
    };

    return Awezoom;
}));
