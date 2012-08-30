// jquery.thread.js - v0.0.1 - 8/26/2012
// https://github.com/yanglindayang/thread
// Copyright (c) 2012 Yang Linda Yang
// http://yanglindayang.com / yanglindayang@gmail.com
// GPL Licensed

;(function($, window, document, undefined) {

    var pluginName = 'thread',
        defaults = {
            blocks: null,
            gridClass: pluginName + '-grid',
            blockClass: pluginName + '-block',
            columnClass: pluginName + '-column',
            layout: {
                columnNumber: {
                    'mobile-vertical': 1,
                    'mobile-horizontal': 1,
                    'ereader': 1,
                    'tablet-vertical': 1,
                    'tablet-horizontal': 1,
                    'desktop': 2,
                    'desktop-large': 3
                },
                gutter: '4%'
            },
            duration: 300,
            onInitial: function() {},
            onOneLoad: function(el) {},
            onAllLoad: function() {}
        },
        count = 0;

    function Thread(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Thread.prototype = {
        init: function() {
            var data = this,
                i = 0,
                gridElement = jQuery('<div/>').addClass(this.options.gridClass).css({
                    'position': 'relative'
                });
            this.$grid = jQuery(this.element).wrap(gridElement);
            this.$blocks = [];
            if (this.options.blocks !== null) {
                this.$blocks = this.options.blocks;
                this.type = 'dynamic';
            } else {
                jQuery(this.element).hide();
                this.$blocks = jQuery(this.element).children();
                this.type = 'static';
            }
            this.blockNumber = this.$blocks.length;
            this.calculateGrid('initial').createColumns(this.columnNumber).renderBlock(0, this.columnNumber);
            jQuery(window).resize(function(e) {
                var currentColumnNumber = data.columnNumber,
                    currentGutter = data.gutter,
                    i, resized = data.calculateGrid(),
                    newColumnNumber = resized.columnNumber;
                if (currentColumnNumber != newColumnNumber) {
                    window.location.reload();
                } else {
                    var columns = resized.$columns;
                    columns.each(function(i) {
                        jQuery(this).children().each(function(i) {
                            if (i >= newColumnNumber) {
                                jQuery(this).css({
                                    marginTop: resized.gutter
                                });
                            }
                        });
                    });

                    if (newColumnNumber > 1) {
                        var columnHeights = [];
                        columns.each(function(i) {
                            var firstChild = jQuery(this).children().eq(0),
                                lastChild = jQuery(this).children().last(),
                                columnHeight = lastChild.position().top + lastChild.outerHeight(true);
                            columnHeights.push(columnHeight);
                            jQuery(this).css({
                                height: columnHeight,
                                width: resized.columnWidth,
                                left: resized.columnWidth * i + resized.gutter * i
                            });
                            firstChild.css({
                                marginTop: 0
                            });
                        });
                        resized.$grid.height(Math.max.apply(null, columnHeights));
                    }
                }
            });
        },
        renderBlock: function(index, columnNumber) {
            if (index < this.blockNumber) {
                var data = this,
                    gutter = 0;
                if (index >= this.columnNumber) {
                    gutter = this.gutter;
                }
                var $block = jQuery(this.$blocks[index]).attr('id', this._defaults.blockClass + '-' + (index + 1)).addClass(this._defaults.blockClass).css({
                    'margin': 0,
                    'padding': 0,
                    'width': '100%',
                    marginTop: gutter
                }),
                    $blockImages = $block.find('img'),
                    blockImagesNumber = $blockImages.length,
                    column = this.minColumn,
                    $column = jQuery(column),
                    offset, duration = this.options.duration,
                    callback = function() {
                        offset = $block.outerHeight() + gutter;
                        if (columnNumber > 1) {
                            data.calculateShortest(offset, $column);
                        }
                        data.options.onOneLoad($block);
                        data.renderBlock(index + 1, columnNumber);
                    };
                if (index === 0) {
                    data.$grid.fadeIn();
                }
                $block.appendTo(column).hide();
                if (blockImagesNumber > 0 && this.type == 'dynamic') {
                    $block.delay(duration * index).fadeIn(duration);
                    $blockImages.on('load', callback);
                } else {
                    $block.delay(duration * index).fadeIn(duration);
                    callback();
                }
                count++;
            } else if (index == this.blockNumber) {
                this.options.onAllLoad();
            }
        },
        analyzeUnits: function(amount, total) {
            var amountString = amount.toString();
            if (amountString.search('px') > -1 || amountString.search('em') > -1) {
                return amount;
            } else {
                return ((parseFloat(amount)) / 100) * total;
            }
        },
        createColumns: function(number) {
            var i, width = this.columnWidth,
                gutter = this.gutter,
                columnClass = this.options.columnClass;
            for (i = 0; i < number; i++) {
                var $column = jQuery('<div></div>').attr('id', columnClass + '-' + (i + 1)).addClass(columnClass);
                if (number > 1) {
                    $column.css({
                        'position': 'absolute',
                        width: width,
                        left: width * i + gutter * i
                    });
                }
                this.$grid.append($column);
            }
            this.$columns = jQuery('.' + this.options.columnClass);
            if (number > 1) {
                this.calculateShortest();
            } else {
                this.minColumn = this.$columns[0];
            }
            return this;
        },
        calculateShortest: function(addedHeight, currentColumn) {
            if (currentColumn) {
                currentColumn.height(addedHeight + currentColumn.height());
            }
            var columns = this.$columns,
                columnHeights = [],
                i;
            columnHeights = columns.map(function(i, el) {
                return jQuery(el).height();
            });
            this.minColumn = columns.map(function(i, el) {
                if (jQuery(el).height() == Math.min.apply(null, columnHeights)) {
                    return el;
                }
            })[0];
            this.maxColumn = columns.map(function(i, el) {
                if (jQuery(el).height() == Math.max.apply(null, columnHeights)) {
                    return el;
                }
            })[0];
            this.$grid.height(jQuery(this.maxColumn).height());
        },
        calculateGrid: function(status) {
            this.windowWidth = jQuery(window).width();
            this.gridWidth = this.$grid.innerWidth();
            this.gutter = this.analyzeUnits(this.options.layout.gutter, this.gridWidth);
            if (this.windowWidth <= 360) {
                this.layout = 'mobile-vertical';
            } else if (this.windowWidth <= 480 && this.windowWidth > 360) {
                this.layout = 'mobile-horizontal';
            } else if (this.windowWidth <= 768 && this.windowWidth > 480) {
                this.layout = 'ereader';
            } else if (this.windowWidth <= 980 && this.windowWidth > 768) {
                this.layout = 'tablet-vertical';
            } else if (this.windowWidth <= 1024 && this.windowWidth > 980) {
                this.layout = 'tablet-horizontal';
            } else if (this.windowWidth <= 1200 && this.windowWidth > 1024) {
                this.layout = 'desktop';
            } else if (this.windowWidth > 1200) {
                this.layout = 'desktop-large';
            }
            this.columnNumber = this.options.layout.columnNumber[this.layout];
            this.columnWidth = (this.gridWidth - (this.columnNumber - 1) * this.gutter) / this.columnNumber;
            if (this.type == 'static' && status == 'initial') {
                this.$blocks.hide();
            }
            return this;
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Thread(this, options));
            }
        });
    };

})(jQuery, window, document);