/*!
* awezoom v1.0.1
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
  let lastTime = 0;
  const vendors = ['moz', 'ms', 'o', 'webkit'];

  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
    window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] || window[`${vendors[x]}CancelRequestAnimationFrame`];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);

      lastTime = currTime + timeToCall;

      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }
}());


const optimizedResize = (function optimizedResize() {
  let callback;
  let running = false;

  const runCallback = function runCallback() {
    callback();

    running = false;
  };

  // fired on resize event
  const throttledResize = function throttledResize() {
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
    },
  };
}());


const hasOwnProp = Object.prototype.hasOwnProperty;


const parseSettings = function parseSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return;
  }

  // Default settings
  const defaultSettings = {
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
      y: 0,
    },

    // updateOnResize: false,
    // showScrollbars: true,

    // onInit: function() {},
    // onDestroy: function() {},
    beforeZoomCallback: function() {},
    afterZoomCallback: function() {}
  };

  let resultSettings = {};

  // TODO: do type check and error alert
  for (let prop in defaultSettings) {
    if (hasOwnProp.call(defaultSettings, prop)) {
      resultSettings[prop] = settings[prop] || defaultSettings[prop];
    }
  }

  return resultSettings;
};


// TODO: cache prefixes
const setCSSStyles = function setCSSStyles(element, styles) {

  for (let style in styles) {
    if (hasOwnProp.call(styles, style)) {

      if (element.style[style] !== undefined) {
        element.style[style] = styles[style];
      } else { // Check vendor prefixes
        const vendorPrefixes = ['webkit', 'Moz', 'ms', 'O'];
        const styleName = style[0].toUpperCase() + style.substr(1);

        for (let prop in vendorPrefixes) {
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
const getTransitionEndEvent = function getTransitionEndEvent() {
  const element = document.createElement('div');
  const transitions = {
    transition: 'transitionend',
    oTransition: 'oTransitionEnd',
    mozTransition: 'transitionend',
    webkitTransition: 'webkitTransitionEnd',
  };
  let transitionEndEvent;

  for (let transition in transitions) {
    if (element.style[transition] !== undefined) {
      transitionEndEvent = transitions[transition];
      break;
    }
  }

  return transitionEndEvent;
};


const valueBetween = function valueBetween(value, min, max) {
  if (min > max) {
    console.warn(`Warning: The minimum value ${min} is bigger than the the maximum value ${max}.`);
  }

  return (Math.min(max, Math.max(min, value)));
};


export default class Awezoom {
  constructor(element, settings) {
    let zoomContainerElement;

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
    const children = zoomContainerElement.children;

    // Wrap content if there is more than one child
    if (children.length > 1) {
      zoomContainerElement.innerHTML = `<div>${zoomContainerElement.innerHTML}</div>`;
    }

    // Get zoom content element
    const zoomContentElement = children[0];

    // Add a placeholder element
    const placeholderElement = document.createElement('div');
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
      position: 'relative',
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
      zoomContainerElement,
      zoomContentElement,
      placeholderElement,
      isZooming: false,
      transitionEndEvent: getTransitionEndEvent(),
      alignment: this.settings.alignment,
      zoomLevel: this.settings.zoomLevel,
      zoomContainerSize: {},
      contentSize: {},
      contentOffset: {
        x: 0,
        y: 0,
      },
      scrollPosition: {},
    };

    this.update();

    // TODO: unbind after destroy
    optimizedResize.addResizeListener(() => {
      this.position();
    });

    // Set initial zoom level and position
    this.zoom(this.state.zoomLevel, {
      x: 0,
      y: 0,
    }, '0ms');
  }

  update() {
    this.state.zoomContainerSize = this.calculateZoomContainerSize();
    this.state.contentSize = this.calculateContentSize();

    // TODO: check if necessary
    this.state.scrollPosition = this.calculateScrollPosition();
  }

  position(zoomDuration = this.settings.zoomDuration, zoomEasing = this.settings.zoomEasing) {
    this.update();

    const currentZoomLevel = this.state.zoomLevel;
    const currentZoomContainerSize = this.state.zoomContainerSize;
    const currentContentSize = this.state.contentSize;
    const targetContentOffset = this.determineIntendedContentOffset();

    if (currentZoomContainerSize.width > currentContentSize.width) {
      setCSSStyles(this.state.placeholderElement, {
        width: '100%',
      });
    }

    if (currentZoomContainerSize.height > currentContentSize.height) {
      setCSSStyles(this.state.placeholderElement, {
        height: '100%',
      });
    }

    setCSSStyles(this.state.zoomContentElement, {
      transitionDuration: zoomDuration,
      transitionTimingFunction: zoomEasing,
      transformOrigin: '0 0 0',
      transform: `matrix(${currentZoomLevel}, 0, 0, ${currentZoomLevel}, ${targetContentOffset.x}, ${targetContentOffset.y})`,
    });

    setCSSStyles(this.state.placeholderElement, {
      width: `${currentContentSize.width + targetContentOffset.x}px`,
      height: `${currentContentSize.height + targetContentOffset.y}px`,
    });

    this.state.contentOffset = targetContentOffset;
  }

  // Zoom
  zoom(zoomLevel = this.settings.zoomLevel, focalPoint = this.settings.focalPoint,
    zoomDuration = this.settings.zoomDuration, zoomEasing = this.settings.zoomEasing, 
    beforeZoomCallback = this.settings.beforeZoomCallback, afterZoomCallback = this.settings.afterZoomCallback) {
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

    const currentZoomLevel = this.state.zoomLevel;
    const currentContentOffset = this.state.contentOffset;
    const currentContentSize = this.state.contentSize;
    const currentScrollPosition = this.state.scrollPosition;
    const zoomedContentSize = this.calculateContentSize(zoomLevel);
    const targetTransformOrigin = this.determineTransformOrigin(focalPoint, currentZoomLevel, zoomLevel);
    const contentOffsetAfterZooming = this.determineIntendedContentOffset(zoomLevel);

    let transitionEndEvent;

    // Calculate new scroll position
    const zoomContainerSize = this.state.zoomContainerSize;
    const focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(targetTransformOrigin, zoomLevel);
    const viewportCoordinates = this.findRawCoordinatesInViewport(targetTransformOrigin);
    const maxScrollPosition = {
      x: (zoomedContentSize.width - zoomContainerSize.width > 0) ? (zoomedContentSize.width - zoomContainerSize.width) : 0,
      y: (zoomedContentSize.height - zoomContainerSize.height > 0) ? (zoomedContentSize.height - zoomContainerSize.height) : 0,
    };
    const newScrollPosition = {
      x: valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
      y: valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y),
    };

    // Calculate new offset
    const transformOffsetToCompensateOrigin = { // Compensate origin
      x: (targetTransformOrigin.x * currentZoomLevel) - targetTransformOrigin.x,
      y: (targetTransformOrigin.y * currentZoomLevel) - targetTransformOrigin.y,
    };
    const transformOffset = {
      x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
      y: transformOffsetToCompensateOrigin.y + currentContentOffset.y,
    };

    // On zoom in: resize placeholder element to stretch content for scrolling
    if (zoomLevel > currentZoomLevel) {
      transformOffset.x += newScrollPosition.x - currentScrollPosition.x;
      transformOffset.y += newScrollPosition.y - currentScrollPosition.y;

      setCSSStyles(this.state.placeholderElement, {
        width: `${zoomedContentSize.width + contentOffsetAfterZooming.x}px`,
        height: `${zoomedContentSize.height + contentOffsetAfterZooming.y}px`,
      });

      this.setScrollPosition(newScrollPosition);

    // On zoom out: resize placeholder to remain content size until transition has ended
    } else {
      setCSSStyles(this.state.placeholderElement, {
        width: `${currentContentSize.width + currentContentOffset.x}px`,
        height: `${currentContentSize.height + currentContentOffset.y}px`,
      });
    }

    // Function to call after transition has ended
    const afterTransition = () => {
      // Reinsert content
      setCSSStyles(this.state.zoomContentElement, {
        transitionDuration: '',
        transitionTimingFunction: '',
        transformOrigin: '0 0 0',
        transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${contentOffsetAfterZooming.x}, ${contentOffsetAfterZooming.y})`,
      });

      // On zoom out resize placeholder and scroll after transition
      if (zoomLevel <= currentZoomLevel) {
        setCSSStyles(this.state.placeholderElement, {
          width: `${zoomedContentSize.width + contentOffsetAfterZooming.x}px`,
          height: `${zoomedContentSize.height + contentOffsetAfterZooming.y}px`,
        });

        this.setScrollPosition(newScrollPosition);
      }

      // Remove event listener
      if (transitionEndEvent) {
        this.state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
      }

      // Update states
      this.state.zoomLevel = zoomLevel;
      this.state.contentSize = zoomedContentSize;
      this.state.contentOffset = contentOffsetAfterZooming;

      this.state.isZooming = false;

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
        transformOrigin: `${targetTransformOrigin.x}px ${targetTransformOrigin.y}px 0`,
        transform: `matrix(${currentZoomLevel}, 0, 0, ${currentZoomLevel}, ${transformOffset.x}, ${transformOffset.y})`,
      });

      this.triggerReflow();

      // Add event listener to execute afterTransition()
      this.state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);

      // Zoom the content
      setCSSStyles(this.state.zoomContentElement, {
        transitionDuration: zoomDuration,
        transitionTimingFunction: zoomEasing,
        transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${transformOffset.x}, ${transformOffset.y})`,
      });
    }
  }

  zoomIn(focalPoint, zoomDuration, zoomEasing) {
    this.zoom(this.state.zoomLevel * this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
  }

  zoomOut(focalPoint, zoomDuration, zoomEasing) {
    this.zoom(this.state.zoomLevel / this.settings.zoomFactor, focalPoint, zoomDuration, zoomEasing);
  }

  zoomToFit(zoomDuration, zoomEasing) {
    const zoomContainerSize = this.state.zoomContainerSize;
    const unzoomedContentSize = this.calculateContentSize(1);
    const widthFactor = zoomContainerSize.width / unzoomedContentSize.width;
    const heightFactor = zoomContainerSize.height / unzoomedContentSize.height;

    let zoomLevel;

    if (widthFactor < heightFactor) {
      zoomLevel = widthFactor;
    } else {
      zoomLevel = heightFactor;
    }

    this.zoom(zoomLevel, {
      x: 0,
      y: 0,
    }, zoomDuration, zoomEasing);
  }

  triggerReflow() {
    // Trigger a reflow to set the transform matrix above before using a transition
    return this.state.zoomContentElement.offsetHeight;
  }

  calculateZoomContainerSize() {
    const element = this.state.zoomContainerElement;

    // the inner size of an element including the padding
    return {
      width: element.clientWidth,
      height: element.clientHeight,
    };
  }

  calculateContentSize(zoomLevel = this.state.zoomLevel) {
    const element = this.state.zoomContentElement;

    // offsetWidth and offsetHeight is the size of an element including padding,
    // borders and scrollbars the size isn't affected by CSS transformations,
    // so it returns the original size
    return {
      width: element.offsetWidth * zoomLevel,
      height: element.offsetHeight * zoomLevel,
    };
  }

  findViewportCoordinatesInRawContent(coordinates) {
    const currentScrollPosition = this.state.scrollPosition;
    const contentOffset = this.state.contentOffset;
    const currentZoomLevel = this.state.zoomLevel;
    const unzoomedContentSize = this.calculateContentSize(1);

    const coordinatesInUnzoomedContent = {
      x: (coordinates.x + currentScrollPosition.x - contentOffset.x) / currentZoomLevel,
      y: (coordinates.y + currentScrollPosition.y - contentOffset.y) / currentZoomLevel,
    };

    return {
      x: valueBetween(coordinatesInUnzoomedContent.x, 0, unzoomedContentSize.width),
      y: valueBetween(coordinatesInUnzoomedContent.y, 0, unzoomedContentSize.height),
    };
  }

  findRawCoordinatesInViewport(coordinates) {
    const currentZoomLevel = this.state.zoomLevel;
    const currentContentOffset = this.state.contentOffset;
    const currentScrollPosition = this.state.scrollPosition;

    return {
      x: (coordinates.x * currentZoomLevel) + (currentContentOffset.x - currentScrollPosition.x),
      y: (coordinates.y * currentZoomLevel) + (currentContentOffset.y - currentScrollPosition.y),
    };
  }

  findRawCoordinatesInZoomedContent(coordinates, zoomLevel) {
    return {
      x: coordinates.x * zoomLevel,
      y: coordinates.y * zoomLevel,
    };
  }

  calculateScrollPosition() {
    const element = this.state.zoomContainerElement;

    return {
      x: element.scrollLeft,
      y: element.scrollTop,
    };
  }

  setScrollPosition(coordinates) {
    const element = this.state.zoomContainerElement;

    // Scroll
    element.scrollLeft = coordinates.x;
    element.scrollTop = coordinates.y;

    // Update state
    this.state.scrollPosition = coordinates;
  }

  determineIntendedContentOffset(zoomLevel = this.state.zoomLevel) {
    const zoomContainerSize = this.state.zoomContainerSize;
    const alignmentSettings = this.state.alignment;
    const zoomedContentSize = this.calculateContentSize(zoomLevel);

    const availableSpace = {
      width: zoomContainerSize.width - zoomedContentSize.width,
      height: zoomContainerSize.height - zoomedContentSize.height,
    };

    const contentOffset = {
      x: 0,
      y: 0,
    };

    if (availableSpace.width > 0) {
      switch (alignmentSettings.horizontal) {
        case 'left': {
          contentOffset.x = 0;
          break;
        }
        case 'right': {
          contentOffset.x = availableSpace.width;
          break;
        }
        case 'center':
        default: {
          contentOffset.x = availableSpace.width / 2;
        }
      }
    }

    if (availableSpace.height > 0) {
      switch (alignmentSettings.vertical) {
        case 'top': {
          contentOffset.y = 0;
          break;
        }
        case 'bottom': {
          contentOffset.y = availableSpace.height;
          break;
        }
        case 'center':
        default: {
          contentOffset.y = availableSpace.height / 2;
        }
      }
    }

    return contentOffset;
  }

  determineContentMargin(zoomLevel, focalPoint) {
    const zoomContainerSize = this.state.zoomContainerSize;
    const zoomedContentSize = this.calculateContentSize(zoomLevel);
    const focalPointInUnzoomedContent = this.findViewportCoordinatesInRawContent(focalPoint);
    const focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(focalPointInUnzoomedContent, zoomLevel);

    const zoomContainerSizeAroundFocalPoint = {
      top: focalPoint.y,
      right: zoomContainerSize.width - focalPoint.x,
      bottom: zoomContainerSize.height - focalPoint.y,
      left: focalPoint.x,
    };

    const contentSizeAroundFocalPointAfterZooming = {
      top: focalPointInZoomedContent.y,
      right: zoomedContentSize.width - focalPointInZoomedContent.x,
      bottom: zoomedContentSize.height - focalPointInZoomedContent.y,
      left: focalPointInZoomedContent.x,
    };

    return {
      top: zoomContainerSizeAroundFocalPoint.top - contentSizeAroundFocalPointAfterZooming.top,
      right: zoomContainerSizeAroundFocalPoint.right - contentSizeAroundFocalPointAfterZooming.right,
      bottom: zoomContainerSizeAroundFocalPoint.bottom - contentSizeAroundFocalPointAfterZooming.bottom,
      left: zoomContainerSizeAroundFocalPoint.left - contentSizeAroundFocalPointAfterZooming.left,
    };
  }

  determineTransformOrigin(focalPoint, currentZoomLevel, newZoomLevel) {
    const currentContentOffset = this.state.contentOffset;
    const alignmentSettings = this.state.alignment;
    const zoomContainerSize = this.state.zoomContainerSize;
    const unzoomedContentSize = this.calculateContentSize(1);
    const currentContentSize = this.calculateContentSize(currentZoomLevel);
    const zoomedContentSize = this.calculateContentSize(newZoomLevel);
    const zoomFactor = newZoomLevel / currentZoomLevel;

    // Ensure that focal point isn't out of content
    const targetFocalPoint = {
      x: valueBetween(focalPoint.x, currentContentOffset.x, currentContentSize.width + currentContentOffset.x),
      y: valueBetween(focalPoint.y, currentContentOffset.y, currentContentSize.height + currentContentOffset.y),
    };

    const contentMarginAfterZooming = this.determineContentMargin(newZoomLevel, targetFocalPoint);
    const transformOrigin = this.findViewportCoordinatesInRawContent(targetFocalPoint);

    // Position content when smaller than the zoom area
    // but just if the content size is smaller than the zoom container size, before and after transition
    if (currentContentSize.width < zoomContainerSize.width && zoomedContentSize.width < zoomContainerSize.width) {
      switch (alignmentSettings.horizontal) {
        case 'left': {
          transformOrigin.x = 0;
          break;
        }
        case 'right': {
          transformOrigin.x = unzoomedContentSize.width;
          break;
        }
        case 'center':
        default: {
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
        case 'left': {
          transformOrigin.x += contentMarginAfterZooming.left / (zoomFactor - 1) / currentZoomLevel;
          break;
        }
        case 'right': {
          transformOrigin.x -= contentMarginAfterZooming.right / (zoomFactor - 1) / currentZoomLevel;
          break;
        }
        case 'center':
        default: {
          transformOrigin.x -= (contentMarginAfterZooming.right - contentMarginAfterZooming.left) / (zoomFactor - 1) / currentZoomLevel / 2;
        }
      }
    }

    // Position content when smaller than the zoom area
    // but just if the content size is smaller than the zoom container size, before and after transition
    if (currentContentSize.height < zoomContainerSize.height && zoomedContentSize.height < zoomContainerSize.height) {
      switch (alignmentSettings.vertical) {
        case 'top': {
          transformOrigin.y = 0;
          break;
        }
        case 'bottom': {
          transformOrigin.y = unzoomedContentSize.height;
          break;
        }
        case 'center':
        default: {
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
        case 'top': {
          transformOrigin.y += contentMarginAfterZooming.top / (zoomFactor - 1) / currentZoomLevel;
          break;
        }
        case 'bottom': {
          transformOrigin.y -= contentMarginAfterZooming.bottom / (zoomFactor - 1) / currentZoomLevel;
          break;
        }
        case 'center':
        default: {
          transformOrigin.y -= (contentMarginAfterZooming.bottom - contentMarginAfterZooming.top) / (zoomFactor - 1) / currentZoomLevel / 2;
        }
      }
    }

    return transformOrigin;
  }

  pinch(pinchEventType, focalPoint, scale) {
    switch (pinchEventType) {
      case 'pinchstart': {
        if (this.state.isZooming) {
          return;
        }

        this.state.isZooming = true;

        this.update();

        const currentZoomLevel = this.state.zoomLevel;
        const currentZoomContainerSize = this.state.zoomContainerSize;
        const currentContentSize = this.state.contentSize;
        const currentContentOffset = this.state.contentOffset;
        const transformOrigin = this.findViewportCoordinatesInRawContent(focalPoint);
        const transformOffsetToCompensateOrigin = { // Compensate origin
          x: (transformOrigin.x * currentZoomLevel) - transformOrigin.x,
          y: (transformOrigin.y * currentZoomLevel) - transformOrigin.y,
        };
        const transformOffset = {
          x: transformOffsetToCompensateOrigin.x + currentContentOffset.x,
          y: transformOffsetToCompensateOrigin.y + currentContentOffset.y,
        };

        if (currentZoomContainerSize.width > currentContentSize.width) {
          setCSSStyles(this.state.placeholderElement, {
            width: '100%',
          });
        }

        if (currentZoomContainerSize.height > currentContentSize.height) {
          setCSSStyles(this.state.placeholderElement, {
            height: '100%',
          });
        }

        // Position content and set focal point
        setCSSStyles(this.state.zoomContentElement, {
          transitionDuration: '',
          transitionTimingFunction: '',
          transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px 0`,
          transform: `matrix(${currentZoomLevel}, 0, 0, ${currentZoomLevel}, ${transformOffset.x}, ${transformOffset.y})`,
        });

        this.state.lastPinchFocalPoint = focalPoint;
        this.state.lastPinchOffset = transformOffset;
        this.state.lastPinchOrigin = transformOrigin;
        this.state.lastPinchZoomLevel = currentZoomLevel;

        break;
      }
      case 'pinchmove': {
        const zoomLevel = scale * this.state.zoomLevel;

        if (zoomLevel < this.settings.minZoomLevel || zoomLevel > this.settings.maxZoomLevel) {
          return;
        }

        // Zoom
        setCSSStyles(this.state.zoomContentElement, {
          transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${this.state.lastPinchOffset.x}, ${this.state.lastPinchOffset.y})`,
        });

        this.state.lastPinchZoomLevel = zoomLevel;

        break;
      }
      case 'pinchend':
      default: {
        if (!this.state.isZooming) {
          return;
        }

        const zoomEasing = this.settings.zoomEasing;
        const zoomDuration = this.settings.zoomDuration;
        const zoomLevel = this.state.lastPinchZoomLevel;

        const transitionEndEvent = this.state.transitionEndEvent;
        const zoomContainerSize = this.state.zoomContainerSize;
        const zoomedContentSize = this.calculateContentSize(zoomLevel);

        // Calculate Offset
        const contentOffsetAfterZooming = this.determineIntendedContentOffset(zoomLevel);
        const contentMarginAfterZooming = this.determineContentMargin(zoomLevel, this.state.lastPinchFocalPoint);
        const transformOffset = {
          x: this.state.lastPinchOffset.x,
          y: this.state.lastPinchOffset.y,
        };

        if (zoomedContentSize.width > zoomContainerSize.width) {
          transformOffset.x -= contentMarginAfterZooming.left > 0 ? contentMarginAfterZooming.left : 0;
          transformOffset.x += contentMarginAfterZooming.right > 0 ? contentMarginAfterZooming.right : 0;
        } else {
          transformOffset.x += (contentOffsetAfterZooming.x - contentMarginAfterZooming.left);
        }

        if (zoomedContentSize.height > zoomContainerSize.height) {
          transformOffset.y -= contentMarginAfterZooming.top > 0 ? contentMarginAfterZooming.top : 0;
          transformOffset.y += contentMarginAfterZooming.bottom > 0 ? contentMarginAfterZooming.bottom : 0;
        } else {
          transformOffset.y += (contentOffsetAfterZooming.y - contentMarginAfterZooming.top);
        }

        // Calculate scroll position
        const focalPointInZoomedContent = this.findRawCoordinatesInZoomedContent(this.state.lastPinchOrigin, zoomLevel);
        const viewportCoordinates = this.state.lastPinchFocalPoint;
        const maxScrollPosition = {
          x: (zoomedContentSize.width - zoomContainerSize.width > 0) ? (zoomedContentSize.width - zoomContainerSize.width) : 0,
          y: (zoomedContentSize.height - zoomContainerSize.height > 0) ? (zoomedContentSize.height - zoomContainerSize.height) : 0,
        };
        const newScrollPosition = {
          x: valueBetween(focalPointInZoomedContent.x - viewportCoordinates.x, 0, maxScrollPosition.x),
          y: valueBetween(focalPointInZoomedContent.y - viewportCoordinates.y, 0, maxScrollPosition.y),
        };

        // Function to call after transition has ended
        const afterTransition = () => {
          // Reinsert content
          setCSSStyles(this.state.zoomContentElement, {
            transitionDuration: '',
            transitionTimingFunction: '',
            transformOrigin: '0 0 0',
            transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${contentOffsetAfterZooming.x}, ${contentOffsetAfterZooming.y})`,
          });

          setCSSStyles(this.state.placeholderElement, {
            width: `${zoomedContentSize.width + contentOffsetAfterZooming.x}px`,
            height: `${zoomedContentSize.height + contentOffsetAfterZooming.y}px`,
          });

          this.setScrollPosition(newScrollPosition);

          // Remove event listener
          if (transitionEndEvent) {
            this.state.zoomContentElement.removeEventListener(transitionEndEvent, afterTransition, false);
          }

          // Update states
          this.state.zoomLevel = zoomLevel;
          this.state.contentOffset = contentOffsetAfterZooming;

          this.state.lastPinchFocalPoint = null;
          this.state.lastPinchOffset = null;
          this.state.lastPinchOrigin = null;
          this.state.lastPinchZoomLevel = null;

          this.state.isZooming = false;
        };

        if (this.state.lastPinchOffset.x !== transformOffset.x || this.state.lastPinchOffset.y !== transformOffset.y) {
          // Add event listener to execute afterTransition()
          this.state.zoomContentElement.addEventListener(transitionEndEvent, afterTransition, false);

          // Move to correct position
          setCSSStyles(this.state.zoomContentElement, {
            transitionDuration: zoomDuration,
            transitionTimingFunction: zoomEasing,
            transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${transformOffset.x}, ${transformOffset.y})`,
          });
        } else {
          afterTransition();
        }
      }
    }
  }
}
