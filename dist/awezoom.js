(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Awezoom"] = factory();
	else
		root["Awezoom"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
* awezoom v1.0.0
* https://github.com/JohannUlbrich/awezoom
*
* Copyright (c) 2016 Johann Ulbrich <info@johann-ulbrich.de>
* Released under the MIT license
*
* Date: 2018-03-18
*/

// requestAnimationFrame polyfill
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
(function requestAnimationFrame() {
  var lastTime = 0;
  var vendors = ['moz', 'ms', 'o', 'webkit'];

  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);

      lastTime = currTime + timeToCall;

      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
})();

var optimizedResize = function optimizedResize() {
  var callback = void 0;
  var running = false;

  var runCallback = function runCallback() {
    callback();

    running = false;
  };

  // fired on resize event
  var throttledResize = function throttledResize() {
    if (!running) {
      running = true;

      window.requestAnimationFrame(runCallback);
    }
  };

  return {
    addResizeListener: function addResizeListener(handleResize) {
      window.addEventListener('resize', throttledResize);

      callback = handleResize;
    },
    removeResizeListener: function removeResizeListener() {
      window.removeEventListener('resize', throttledResize);
    }
  };
}();

var hasOwnProp = Object.prototype.hasOwnProperty;

var parseSettings = function parseSettings(settings) {
  if (!settings || (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {
    return;
  }

  // Default settings
  var defaultSettings = {
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
      horizontal: 'center', // left, center, right
      vertical: 'center' // top, center, bottom
    },

    // CSS transition-timing-function
    zoomEasing: 'ease-in-out',

    // CSS transition-duration in milliseconds
    zoomDuration: '300ms',

    // Default point to zoom in or out
    focalPoint: {
      x: 0,
      y: 0
    },

    // updateOnResize: false,
    // showScrollbars: true,

    // onInit: function() {},
    // onDestroy: function() {},
    beforeZoomCallback: function beforeZoomCallback() {},
    afterZoomCallback: function afterZoomCallback() {}
  };

  var resultSettings = {};

  // TODO: do type check and error alert
  for (var prop in defaultSettings) {
    if (hasOwnProp.call(defaultSettings, prop)) {
      resultSettings[prop] = settings[prop] || defaultSettings[prop];
    }
  }

  return resultSettings;
};

// TODO: cache prefixes
var setCSSStyles = function setCSSStyles(element, styles) {

  for (var style in styles) {
    if (hasOwnProp.call(styles, style)) {

      if (element.style[style] !== undefined) {
        element.style[style] = styles[style];
      } else {
        // Check vendor prefixes
        var vendorPrefixes = ['webkit', 'Moz', 'ms', 'O'];
        var styleName = style[0].toUpperCase() + style.substr(1);

        for (var prop in vendorPrefixes) {
          if (hasOwnProp.call(vendorPrefixes, prop)) {
            if (element.style[vendorPrefixes[prop] + styleName] !== undefined) {
              element.style[vendorPrefixes[prop] + styleName] = styles[style];
              break;
            }
          }
        }
      }
    }
  }
};

// TODO: check compatibility (IE 9 dosn't support transition end event)
var getTransitionEndEvent = function getTransitionEndEvent() {
  var element = document.createElement('div');
  var transitions = {
    transition: 'transitionend',
    oTransition: 'oTransitionEnd',
    mozTransition: 'transitionend',
    webkitTransition: 'webkitTransitionEnd'
  };
  var transitionEndEvent = void 0;

  for (var transition in transitions) {
    if (element.style[transition] !== undefined) {
      transitionEndEvent = transitions[transition];
      break;
    }
  }

  return transitionEndEvent;
};

var valueBetween = function valueBetween(value, min, max) {
  if (min > max) {
    console.warn('Warning: The minimum value ' + min + ' is bigger than the the maximum value ' + max + '.');
  }

  return Math.min(max, Math.max(min, value));
};

var Awezoom = function () {
  function Awezoom(element, settings) {
    var _this = this;

    _classCallCheck(this, Awezoom);

    var zoomContainerElement = void 0;

    // Get zoom container element
    if (typeof element === 'string') {
      zoomContainerElement = document.querySelector(element);
    } else if (element.nodeType && element.nodeType === 1) {
      zoomContainerElement = element;
    }

    // Ensure that the zoom container exist
    if (!zoomContainerElement) {
      console.warn('Warning: The zoom container element was not found.');

      return;
    }

    // Parse settings
    this.settings = parseSettings(settings);

    // TODO: Always wrap content when chrome mobile transition lag bug is solved
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

    // TODO: Use when chrome mobile transition lag bug is solved 
    // // Prepare DOM
    // zoomContainerElement.innerHTML = `<div><div>${zoomContainerElement.innerHTML}</div></div>`;

    // // Get elements
    // const placeholderElement = zoomContainerElement.children[0];
    // const zoomContentElement = placeholderElement.children[0];

    // Set initial styles
    setCSSStyles(zoomContainerElement, {
      overflow: 'scroll',
      position: 'relative'
    });
    setCSSStyles(placeholderElement, {
      position: 'absolute',
      overflow: 'hidden',
      transform: 'translateZ(0)'
    });
    setCSSStyles(zoomContentElement, {
      position: 'absolute',
      transformOrigin: '0 0 0'
    });

    // Cache internal state
    this.state = {
      zoomContainerElement: zoomContainerElement,
      zoomContentElement: zoomContentElement,
      placeholderElement: placeholderElement,
      isZooming: false,
      transitionEndEvent: getTransitionEndEvent(),
      alignment: this.settings.alignment,
      zoomLevel: this.settings.zoomLevel,
      zoomContainerSize: {},
      contentSize: {},
      contentOffset: {
        x: 0,
        y: 0
      },
      scrollPosition: {}
    };

    this.update();

    // TODO: unbind after destroy
    optimizedResize.addResizeListener(function () {
      _this.position();
    });

    // Set initial zoom level and position
    this.zoom(this.state.zoomLevel, {
      x: 0,
      y: 0
    }, '0ms');
  }

  _createClass(Awezoom, [{
    key: 'update',
    value: function update() {
      this.state.zoomContainerSize = this.calculateZoomContainerSize();
      this.state.contentSize = this.calculateContentSize();

      // TODO: check if necessary
      this.state.scrollPosition = this.calculateScrollPosition();
    }
  }, {
    key: 'position',
    value: function position() {
      var zoomDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.settings.zoomDuration;
      var zoomEasing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.zoomEasing;

      this.update();

      var currentZoomLevel = this.state.zoomLevel;
      var currentZoomContainerSize = this.state.zoomContainerSize;
      var currentContentSize = this.state.contentSize;
      var targetContentOffset = this.determineIntendedContentOffset();

      if (currentZoomContainerSize.width > currentContentSize.width) {
        setCSSStyles(this.state.placeholderElement, {
          width: '100%'
        });
      }

      if (currentZoomContainerSize.height > currentContentSize.height) {
        setCSSStyles(this.state.placeholderElement, {
          height: '100%'
        });
      }

      setCSSStyles(this.state.zoomContentElement, {
        transitionDuration: zoomDuration,
        transitionTimingFunction: zoomEasing,
        transformOrigin: '0 0 0',
        transform: 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + targetContentOffset.x + ', ' + targetContentOffset.y + ')'
      });

      setCSSStyles(this.state.placeholderElement, {
        width: currentContentSize.width + targetContentOffset.x + 'px',
        height: currentContentSize.height + targetContentOffset.y + 'px'
      });

      this.state.contentOffset = targetContentOffset;
    }

    // Zoom

  }, {
    key: 'zoom',
    value: function zoom() {
      var zoomLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.settings.zoomLevel;
      var focalPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.focalPoint;
      var zoomDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.settings.zoomDuration;
      var zoomEasing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.settings.zoomEasing;

      var _this2 = this;

      var beforeZoomCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.settings.beforeZoomCallback;
      var afterZoomCallback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : this.settings.afterZoomCallback;

      if (this.state.isZooming) {
        return;
      }

      if (zoomLevel < this.settings.minZoomLevel || zoomLevel > this.settings.maxZoomLevel) {
        return;
      }

      this.state.isZooming = true;

      // Call before zoom callback method
      beforeZoomCallback();

      this.update();

      var currentZoomLevel = this.state.zoomLevel;
      var currentContentOffset = this.state.contentOffset;
      var currentContentSize = this.state.contentSize;
      var currentScrollPosition = this.state.scrollPosition;
      var zoomedContentSize = this.calculateContentSize(zoomLevel);
      var targetTransformOrigin = this.determineTransformOrigin(focalPoint, currentZoomLevel, zoomLevel);
      var contentOffsetAfterZooming = this.determineIntendedContentOffset(zoomLevel);

      var transitionEndEvent = void 0;

      // Calculate new scroll position
      var zoomContainerSize = this.state.zoomContainerSize;
      var focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(targetTransformOrigin, zoomLevel);
      var viewportCoordinates = this.findRawCoordinatesInViewport(targetTransformOrigin);
      var maxScrollPosition = {
        x: zoomedContentSize.width - zoomContainerSize.width > 0 ? zoomedContentSize.width - zoomContainerSize.width : 0,
        y: zoomedContentSize.height - zoomContainerSize.height > 0 ? zoomedContentSize.height - zoomContainerSize.height : 0
      };
      var newScrollPosition = {
        x: valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
        y: valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y)
      };

      // Calculate new offset
      var transformOffsetToCompensateOrigin = { // Compensate origin
        x: targetTransformOrigin.x * currentZoomLevel - targetTransformOrigin.x,
        y: targetTransformOrigin.y * currentZoomLevel - targetTransformOrigin.y
      };
      var transformOffset = {
        x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
        y: transformOffsetToCompensateOrigin.y + currentContentOffset.y
      };

      // On zoom in: resize placeholder element to stretch content for scrolling
      if (zoomLevel > currentZoomLevel) {
        transformOffset.x += newScrollPosition.x - currentScrollPosition.x;
        transformOffset.y += newScrollPosition.y - currentScrollPosition.y;

        setCSSStyles(this.state.placeholderElement, {
          width: zoomedContentSize.width + contentOffsetAfterZooming.x + 'px',
          height: zoomedContentSize.height + contentOffsetAfterZooming.y + 'px'
        });

        this.setScrollPosition(newScrollPosition);

        // On zoom out: resize placeholder to remain content size until transition has ended
      } else {
        setCSSStyles(this.state.placeholderElement, {
          width: currentContentSize.width + currentContentOffset.x + 'px',
          height: currentContentSize.height + currentContentOffset.y + 'px'
        });
      }

      // Function to call after transition has ended
      var afterTransition = function afterTransition() {
        // Reinsert content
        setCSSStyles(_this2.state.zoomContentElement, {
          transitionDuration: '',
          transitionTimingFunction: '',
          transformOrigin: '0 0 0',
          transform: 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + contentOffsetAfterZooming.x + ', ' + contentOffsetAfterZooming.y + ')'
        });

        // On zoom out resize placeholder and scroll after transition
        if (zoomLevel <= currentZoomLevel) {
          setCSSStyles(_this2.state.placeholderElement, {
            width: zoomedContentSize.width + contentOffsetAfterZooming.x + 'px',
            height: zoomedContentSize.height + contentOffsetAfterZooming.y + 'px'
          });

          _this2.setScrollPosition(newScrollPosition);
        }

        // Remove event listener
        if (transitionEndEvent) {
          _this2.state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
        }

        // Update states
        _this2.state.zoomLevel = zoomLevel;
        _this2.state.contentSize = zoomedContentSize;
        _this2.state.contentOffset = contentOffsetAfterZooming;

        _this2.state.isZooming = false;

        // Call after zoom callback method
        afterZoomCallback();
      };

      if (zoomDuration.replace(/[^\d\.,]/g, '') <= 0 || currentZoomLevel === zoomLevel) {
        // Call manually if there is no transition event
        afterTransition();
      } else {
        transitionEndEvent = this.state.transitionEndEvent;

        // Position content and set focal point
        setCSSStyles(this.state.zoomContentElement, {
          transitionDuration: '',
          transitionTimingFunction: '',
          transformOrigin: targetTransformOrigin.x + 'px ' + targetTransformOrigin.y + 'px 0',
          transform: 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
        });

        this.triggerReflow();

        // Add event listener to execute afterTransition()
        this.state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);

        // Zoom the content
        setCSSStyles(this.state.zoomContentElement, {
          transitionDuration: zoomDuration,
          transitionTimingFunction: zoomEasing,
          transform: 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
        });
      }
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn(focalPoint, zoomDuration, zoomEasing) {
      this.zoom(this.state.zoomLevel * this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut(focalPoint, zoomDuration, zoomEasing) {
      this.zoom(this.state.zoomLevel / this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
    }
  }, {
    key: 'zoomToFit',
    value: function zoomToFit(zoomDuration, zoomEasing) {
      var zoomContainerSize = this.state.zoomContainerSize;
      var unzoomedContentSize = this.calculateContentSize(1);
      var widthFactor = zoomContainerSize.width / unzoomedContentSize.width;
      var heightFactor = zoomContainerSize.height / unzoomedContentSize.height;

      var zoomLevel = void 0;

      if (widthFactor < heightFactor) {
        zoomLevel = widthFactor;
      } else {
        zoomLevel = heightFactor;
      }

      this.zoom(zoomLevel, {
        x: 0,
        y: 0
      }, zoomDuration, zoomEasing);
    }
  }, {
    key: 'triggerReflow',
    value: function triggerReflow() {
      // Trigger a reflow to set the transform matrix above before using a transition
      return this.state.zoomContentElement.offsetHeight;
    }
  }, {
    key: 'calculateZoomContainerSize',
    value: function calculateZoomContainerSize() {
      var element = this.state.zoomContainerElement;

      // the inner size of an element including the padding
      return {
        width: element.clientWidth,
        height: element.clientHeight
      };
    }
  }, {
    key: 'calculateContentSize',
    value: function calculateContentSize() {
      var zoomLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.zoomLevel;

      var element = this.state.zoomContentElement;

      // offsetWidth and offsetHeight is the size of an element including padding,
      // borders and scrollbars the size isn't affected by CSS transformations,
      // so it returns the original size
      return {
        width: element.offsetWidth * zoomLevel,
        height: element.offsetHeight * zoomLevel
      };
    }
  }, {
    key: 'findViewportCoordinatesInRawContent',
    value: function findViewportCoordinatesInRawContent(coordinates) {
      var currentScrollPosition = this.state.scrollPosition;
      var contentOffset = this.state.contentOffset;
      var currentZoomLevel = this.state.zoomLevel;
      var unzoomedContentSize = this.calculateContentSize(1);

      var coordinatesInUnzoomedContent = {
        x: (coordinates.x + currentScrollPosition.x - contentOffset.x) / currentZoomLevel,
        y: (coordinates.y + currentScrollPosition.y - contentOffset.y) / currentZoomLevel
      };

      return {
        x: valueBetween(coordinatesInUnzoomedContent.x, 0, unzoomedContentSize.width),
        y: valueBetween(coordinatesInUnzoomedContent.y, 0, unzoomedContentSize.height)
      };
    }
  }, {
    key: 'findRawCoordinatesInViewport',
    value: function findRawCoordinatesInViewport(coordinates) {
      var currentZoomLevel = this.state.zoomLevel;
      var currentContentOffset = this.state.contentOffset;
      var currentScrollPosition = this.state.scrollPosition;

      return {
        x: coordinates.x * currentZoomLevel + (currentContentOffset.x - currentScrollPosition.x),
        y: coordinates.y * currentZoomLevel + (currentContentOffset.y - currentScrollPosition.y)
      };
    }
  }, {
    key: 'findRawCoordinatesInZoomedContent',
    value: function findRawCoordinatesInZoomedContent(coordinates, zoomLevel) {
      return {
        x: coordinates.x * zoomLevel,
        y: coordinates.y * zoomLevel
      };
    }
  }, {
    key: 'calculateScrollPosition',
    value: function calculateScrollPosition() {
      var element = this.state.zoomContainerElement;

      return {
        x: element.scrollLeft,
        y: element.scrollTop
      };
    }
  }, {
    key: 'setScrollPosition',
    value: function setScrollPosition(coordinates) {
      var element = this.state.zoomContainerElement;

      // Scroll
      element.scrollLeft = coordinates.x;
      element.scrollTop = coordinates.y;

      // Update state
      this.state.scrollPosition = coordinates;
    }
  }, {
    key: 'determineIntendedContentOffset',
    value: function determineIntendedContentOffset() {
      var zoomLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.zoomLevel;

      var zoomContainerSize = this.state.zoomContainerSize;
      var alignmentSettings = this.state.alignment;
      var zoomedContentSize = this.calculateContentSize(zoomLevel);

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
            {
              contentOffset.x = 0;
              break;
            }
          case 'right':
            {
              contentOffset.x = availableSpace.width;
              break;
            }
          case 'center':
          default:
            {
              contentOffset.x = availableSpace.width / 2;
            }
        }
      }

      if (availableSpace.height > 0) {
        switch (alignmentSettings.vertical) {
          case 'top':
            {
              contentOffset.y = 0;
              break;
            }
          case 'bottom':
            {
              contentOffset.y = availableSpace.height;
              break;
            }
          case 'center':
          default:
            {
              contentOffset.y = availableSpace.height / 2;
            }
        }
      }

      return contentOffset;
    }
  }, {
    key: 'determineContentMargin',
    value: function determineContentMargin(zoomLevel, focalPoint) {
      var zoomContainerSize = this.state.zoomContainerSize;
      var zoomedContentSize = this.calculateContentSize(zoomLevel);
      var focalPointInUnzoomedContent = this.findViewportCoordinatesInRawContent(focalPoint);
      var focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(focalPointInUnzoomedContent, zoomLevel);

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
    }
  }, {
    key: 'determineTransformOrigin',
    value: function determineTransformOrigin(focalPoint, currentZoomLevel, newZoomLevel) {
      var currentContentOffset = this.state.contentOffset;
      var alignmentSettings = this.state.alignment;
      var zoomContainerSize = this.state.zoomContainerSize;
      var unzoomedContentSize = this.calculateContentSize(1);
      var currentContentSize = this.calculateContentSize(currentZoomLevel);
      var zoomedContentSize = this.calculateContentSize(newZoomLevel);
      var zoomFactor = newZoomLevel / currentZoomLevel;

      // Ensure that focal point isn't out of content
      var targetFocalPoint = {
        x: valueBetween(focalPoint.x, currentContentOffset.x, currentContentSize.width + currentContentOffset.x),
        y: valueBetween(focalPoint.y, currentContentOffset.y, currentContentSize.height + currentContentOffset.y)
      };

      var contentMarginAfterZooming = this.determineContentMargin(newZoomLevel, targetFocalPoint);
      var transformOrigin = this.findViewportCoordinatesInRawContent(targetFocalPoint);

      // Position content when smaller than the zoom area
      // but just if the content size is smaller than the zoom container size, before and after transition
      if (currentContentSize.width < zoomContainerSize.width && zoomedContentSize.width < zoomContainerSize.width) {
        switch (alignmentSettings.horizontal) {
          case 'left':
            {
              transformOrigin.x = 0;
              break;
            }
          case 'right':
            {
              transformOrigin.x = unzoomedContentSize.width;
              break;
            }
          case 'center':
          default:
            {
              transformOrigin.x = unzoomedContentSize.width / 2;
            }
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
            {
              transformOrigin.x += contentMarginAfterZooming.left / (zoomFactor - 1) / currentZoomLevel;
              break;
            }
          case 'right':
            {
              transformOrigin.x -= contentMarginAfterZooming.right / (zoomFactor - 1) / currentZoomLevel;
              break;
            }
          case 'center':
          default:
            {
              transformOrigin.x -= (contentMarginAfterZooming.right - contentMarginAfterZooming.left) / (zoomFactor - 1) / currentZoomLevel / 2;
            }
        }
      }

      // Position content when smaller than the zoom area
      // but just if the content size is smaller than the zoom container size, before and after transition
      if (currentContentSize.height < zoomContainerSize.height && zoomedContentSize.height < zoomContainerSize.height) {
        switch (alignmentSettings.vertical) {
          case 'top':
            {
              transformOrigin.y = 0;
              break;
            }
          case 'bottom':
            {
              transformOrigin.y = unzoomedContentSize.height;
              break;
            }
          case 'center':
          default:
            {
              transformOrigin.y = unzoomedContentSize.height / 2;
            }
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
            {
              transformOrigin.y += contentMarginAfterZooming.top / (zoomFactor - 1) / currentZoomLevel;
              break;
            }
          case 'bottom':
            {
              transformOrigin.y -= contentMarginAfterZooming.bottom / (zoomFactor - 1) / currentZoomLevel;
              break;
            }
          case 'center':
          default:
            {
              transformOrigin.y -= (contentMarginAfterZooming.bottom - contentMarginAfterZooming.top) / (zoomFactor - 1) / currentZoomLevel / 2;
            }
        }
      }

      return transformOrigin;
    }
  }, {
    key: 'pinch',
    value: function pinch(pinchEventType, focalPoint, scale) {
      var _this3 = this;

      switch (pinchEventType) {
        case 'pinchstart':
          {
            if (this.state.isZooming) {
              return;
            }

            this.state.isZooming = true;

            var currentZoomLevel = this.state.zoomLevel;
            var currentZoomContainerSize = this.state.zoomContainerSize;
            var currentContentSize = this.state.contentSize;
            var currentContentOffset = this.state.contentOffset;
            var transformOrigin = this.findViewportCoordinatesInRawContent(focalPoint);
            var transformOffsetToCompensateOrigin = { // Compensate origin
              x: transformOrigin.x * currentZoomLevel - transformOrigin.x,
              y: transformOrigin.y * currentZoomLevel - transformOrigin.y
            };
            var transformOffset = {
              x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
              y: transformOffsetToCompensateOrigin.y + currentContentOffset.y
            };

            if (currentZoomContainerSize.width > currentContentSize.width) {
              setCSSStyles(this.state.placeholderElement, {
                width: '100%'
              });
            }

            if (currentZoomContainerSize.height > currentContentSize.height) {
              setCSSStyles(this.state.placeholderElement, {
                height: '100%'
              });
            }

            // Position content and set focal point
            setCSSStyles(this.state.zoomContentElement, {
              transitionDuration: '',
              transitionTimingFunction: '',
              transformOrigin: transformOrigin.x + 'px ' + transformOrigin.y + 'px 0',
              transform: 'matrix(' + currentZoomLevel + ', 0, 0, ' + currentZoomLevel + ', ' + transformOffset.x + ', ' + transformOffset.y + ')'
            });

            this.state.lastPinchFocalPoint = focalPoint;
            this.state.lastPinchOffset = transformOffset;
            this.state.lastPinchOrigin = transformOrigin;
            this.state.lastPinchZoomLevel = currentZoomLevel;

            break;
          }
        case 'pinchmove':
          {
            var zoomLevel = scale * this.state.zoomLevel;

            if (zoomLevel < this.settings.minZoomLevel || zoomLevel > this.settings.maxZoomLevel) {
              return;
            }

            // Zoom
            setCSSStyles(this.state.zoomContentElement, {
              transform: 'matrix(' + zoomLevel + ', 0, 0, ' + zoomLevel + ', ' + this.state.lastPinchOffset.x + ', ' + this.state.lastPinchOffset.y + ')'
            });

            this.state.lastPinchZoomLevel = zoomLevel;

            break;
          }
        case 'pinchend':
        default:
          {
            if (!this.state.isZooming) {
              return;
            }

            var zoomEasing = this.settings.zoomEasing;
            var zoomDuration = this.settings.zoomDuration;
            var _zoomLevel = this.state.lastPinchZoomLevel;

            var transitionEndEvent = this.state.transitionEndEvent;
            var zoomContainerSize = this.state.zoomContainerSize;
            var zoomedContentSize = this.calculateContentSize(_zoomLevel);

            // Calculate Offset
            var contentOffsetAfterZooming = this.determineIntendedContentOffset(_zoomLevel);
            var contentMarginAfterZooming = this.determineContentMargin(_zoomLevel, this.state.lastPinchFocalPoint);
            var _transformOffset = {
              x: this.state.lastPinchOffset.x,
              y: this.state.lastPinchOffset.y
            };

            if (zoomedContentSize.width > zoomContainerSize.width) {
              _transformOffset.x -= contentMarginAfterZooming.left > 0 ? contentMarginAfterZooming.left : 0;
              _transformOffset.x += contentMarginAfterZooming.right > 0 ? contentMarginAfterZooming.right : 0;
            } else {
              _transformOffset.x += contentOffsetAfterZooming.x - contentMarginAfterZooming.left;
            }

            if (zoomedContentSize.height > zoomContainerSize.height) {
              _transformOffset.y -= contentMarginAfterZooming.top > 0 ? contentMarginAfterZooming.top : 0;
              _transformOffset.y += contentMarginAfterZooming.bottom > 0 ? contentMarginAfterZooming.bottom : 0;
            } else {
              _transformOffset.y += contentOffsetAfterZooming.y - contentMarginAfterZooming.top;
            }

            // Calculate scroll position
            var focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(this.state.lastPinchOrigin, _zoomLevel);
            var viewportCoordinates = this.state.lastPinchFocalPoint;
            var maxScrollPosition = {
              x: zoomedContentSize.width - zoomContainerSize.width > 0 ? zoomedContentSize.width - zoomContainerSize.width : 0,
              y: zoomedContentSize.height - zoomContainerSize.height > 0 ? zoomedContentSize.height - zoomContainerSize.height : 0
            };
            var newScrollPosition = {
              x: valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
              y: valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y)
            };

            // Function to call after transition has ended
            var afterTransition = function afterTransition() {
              // Reinsert content
              setCSSStyles(_this3.state.zoomContentElement, {
                transitionDuration: '',
                transitionTimingFunction: '',
                transformOrigin: '0 0 0',
                transform: 'matrix(' + _zoomLevel + ', 0, 0, ' + _zoomLevel + ', ' + contentOffsetAfterZooming.x + ', ' + contentOffsetAfterZooming.y + ')'
              });

              setCSSStyles(_this3.state.placeholderElement, {
                width: zoomedContentSize.width + contentOffsetAfterZooming.x + 'px',
                height: zoomedContentSize.height + contentOffsetAfterZooming.y + 'px'
              });

              _this3.setScrollPosition(newScrollPosition);

              // Remove event listener
              if (transitionEndEvent) {
                _this3.state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
              }

              // Update states
              _this3.state.zoomLevel = _zoomLevel;
              _this3.state.contentOffset = contentOffsetAfterZooming;

              _this3.state.lastPinchFocalPoint = null;
              _this3.state.lastPinchOffset = null;
              _this3.state.lastPinchOrigin = null;
              _this3.state.lastPinchZoomLevel = null;

              _this3.state.isZooming = false;
            };

            if (this.state.lastPinchOffset.x !== _transformOffset.x || this.state.lastPinchOffset.y !== _transformOffset.y) {
              // Add event listener to execute afterTransition()
              this.state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);

              // Move to correct position
              setCSSStyles(this.state.zoomContentElement, {
                transitionDuration: zoomDuration,
                transitionTimingFunction: zoomEasing,
                transform: 'matrix(' + _zoomLevel + ', 0, 0, ' + _zoomLevel + ', ' + _transformOffset.x + ', ' + _transformOffset.y + ')'
              });
            } else {
              afterTransition();
            }
          }
      }
    }
  }]);

  return Awezoom;
}();

exports.default = Awezoom;
module.exports = exports['default'];

/***/ })

/******/ });
});
//# sourceMappingURL=awezoom.js.map