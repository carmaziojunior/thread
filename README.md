# [jQuery.Thread.js Plugin](https://github.com/yanglindayang/thread) v0.0.1

A jQuery plugin to render block elements of uneven heights into responsive grid with equal-width columns and even gutters. You may have seen this type of layout elsewhere on the web. Fades each block in sequentially and waits for image of previous block to finish loading before rendering.

## Features

* Accepts array of dynamically generated elements or a selector for the container element.

## Usage

```js
jQuery(document).ready(function() {
    jQuery('#content').thread();
});
```

## Caveats

* True responsiveness currently not supported. Forces full page refresh when column number changes with window resize.

## Planned Improvements

* Structure using Backbone.
* Build out true responsiveness by recalculating dynamically without page refresh.
* Support taking JSONP feed and template rendering.
* Add slide down effect option.

## License

Copyright (c) 2012 Yang Linda Yang. This plugin is licensed under the [GNU GPL license](http://www.gnu.org/copyleft/gpl.html). For more information, please read the license ([LICENSE](https://github.com/yanglindayang/thread/blob/master/LICENSE) and [LICENSE-GPL.txt](https://github.com/yanglindayang/thread/blob/master/LICENSE-GPL.txt)) and/or visit the GNU website.

## Contact

* http://twitter.com/yanglindayang
* http://github.com/yanglindayang
* http://yanglindayang.com