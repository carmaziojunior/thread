/*

call like thus:

jQuery(document).ready(function() {
    jQuery('#content').thread({
        blockClass: 'article'
    });
});

*/

;
(function($, window, document, undefined) {

    var pluginName = 'thread',
        defaults = {
            blocks: null,
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
            animation: {
                effect: 'fadeIn',
                duration: 500
            },
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
                i = 0;
            this.$grid = jQuery(this.element);
            this.$grid.css({
                'position': 'relative'
            });
            this.$blocks = [];
            if (this.options.blocks !== null) {
                this.blocks = this.options.blocks;
            } else if (this.options.blockClass != this._defaults.blockClass) {
                this.blocks = jQuery(this.options.blockClass);
            } else {
                this.blocks = jQuery('.' + this.options.blockClass);
            }
            this.blockNumber = this.blocks.length;
            this.calculateGrid().createColumns(this.columnNumber);
            this.renderBlock(0, this.columnNumber);
            jQuery(window).resize(function(e) {
                console.log(e);
                var currentColumnNumber = data.columnNumber,
                    currentGutter = data.gutter,
                    i, resized = data.calculateGrid(),
                    newColumnNumber = resized.columnNumber;
                if (currentColumnNumber != newColumnNumber) {
                    window.location.reload();
                } else {
                    console.log(resized.columnWidth, resized.gutter);
                    var difference = resized.gutter - currentGutter;
                    jQuery(resized.$blocks).each(function(i) {
                        if (i >= newColumnNumber) {
                            jQuery(this).css({
                                marginTop: jQuery(this).css('margin-top') - difference
                            });
                        }
                    });
                    if (newColumnNumber > 1) {
                        resized.$columns.each(function(i) {
                            jQuery(this).css({
                                width: resized.columnWidth,
                                left: resized.columnWidth * i + resized.gutter * i
                            });
                            console.log(resized.columnWidth, 'column' + i);
                            resized.calculateShortest(difference * i, jQuery(this));
                        });
                    }
                }
            });
        },
        renderBlock: function(index, columnNumber) {
            if (index < this.blockNumber) {
                var data = this,
                    $block = jQuery(this.blocks[index]).attr('id', this.options.blockClass + '-' + (index + 1)).addClass(this.options.blockClass),
                    $blockImages = $block.find('img'),
                    blockImagesNumber = $blockImages.length,
                    column = this.minColumn,
                    $column = jQuery(column),
                    currentHeight = $column.height(),
                    animation = this.options.animation,
                    duration = animation.duration,
                    offset = this.gutter,
                    blockCSS = {
                        'margin': 0,
                        'padding': 0,
                        'width': '100%',
                        marginTop: this.gutter
                    },
                    callback = function() {
                        offset += $block.height();
                        if (columnNumber > 1) {
                            data.calculateShortest(offset, $column);
                        }
                        data.options.onOneLoad($block);
                        data.$blocks.push($block);
                        data.renderBlock(index + 1, columnNumber);
                    };
                console.log($block);
                $block.appendTo(column).hide();
                if (animation.effect == 'fadeIn') {
                    $block.delay(duration * count).fadeIn(duration).css(blockCSS);
                } else if (animation.effect == 'slideDown') {
                    $block.delay(duration * count).slideDown(duration).css(blockCSS);
                } else {
                    $block.show().css(blockCSS);
                }
                if (index < columnNumber) {
                    $block.css({
                        'margin': 0
                    });
                }
                count++;
                if (blockImagesNumber > 0) {
                    $blockImages.on('load', callback);
                } else {
                    callback();
                }
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
            console.log(this.minColumn);
        },
        calculateShortest: function(offset, currentColumn) {
            if (currentColumn) {
                currentColumn.css({
                    height: currentColumn.height() + offset
                });
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
        calculateGrid: function() {
            this.windowWidth = jQuery(window).width();
            this.gridWidth = this.$grid.innerWidth();
            this.gutter = this.analyzeUnits(this.options.layout.gutter, this.gridWidth);
            this.currentHeight = 0;
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
            console.log(this);
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