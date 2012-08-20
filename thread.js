;(function($, window, document, undefined) {

    var pluginName = 'thread',
        defaults = {
            blocks: null,
            blockClass: pluginName + '-block',
            columnClass: pluginName + '-column',
            layout: {
                columnWidth: 0,
                columnNumber: {
                    'mobile-vertical': 1,
                    'mobile-horizontal': 1,
                    'ereader': 1,
                    'tablet-vertical': 1,
                    'default': 2,
                    'desktop': 3
                },
                gutter: '4%'
            },
            animation: {
                effect: false,
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
            if (this.options.blocks !== null) {
                this.$blocks = this.options.blocks;
            } else if (this.options.blockClass != this._defaults.blockClass) {
                this.$blocks = jQuery(this.options.blockClass);
            } else {
                this.$blocks = jQuery('.' + this.options.blockClass);
            }
            this.blockNumber = this.$blocks.length;
            this.calculateGrid().createColumns(this.columnNumber);
            this.renderBlock(0);
        },
        renderBlock: function(index) {
            if (count < this.blockNumber) {
                var data = this,
                    $block = jQuery(this.$blocks[index]).attr('id', this.options.blockClass + '-' + (index + 1)).addClass(this.options.blockClass),
                    $blockImages = $block.find('img'),
                    blockImagesNumber = $blockImages.length,
                    offset = this.gutter,
                    column = this.minColumn,
                    $column = jQuery(column),
                    currentHeight = $column.height(),
                    blockCSS = {
                        'position': 'absolute',
                        'margin': 0,
                        'padding': 0,
                        'width': '100%',
                        top: currentHeight,
                        left: 0
                    },
                    callback = function() {
                        offset += $block.height();
                        data.calculateShortest(offset, $column);
                        data.options.onOneLoad($block);
                        data.renderBlock(index + 1);
                    },
                    animation = this.options.animation,
                    duration = animation.duration;
                $block.appendTo(column).hide();
                if (animation.effect == 'fadeIn') {
                    $block.delay(duration * count).fadeIn(duration).css(blockCSS);
                } else if (animation.effect == 'slideDown') {
                    $block.delay(duration * count).slideDown(duration).css(blockCSS);
                } else {
                    $block.show().css(blockCSS);
                }
                count++;
                if (blockImagesNumber > 0) {
                    $blockImages.on('load', callback);
                } else {
                    callback();
                }
            } else if (count == this.blockNumber) {
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
            var i, width = this.options.layout.columnWidth,
                gutter = this.gutter,
                columnClass = this.options.columnClass;
            for (i = 0; i < number; i++) {
                var $column = jQuery('<div></div>').attr('id', columnClass + '-' + (i + 1)).addClass(columnClass).width(width).css({
                    'position': 'absolute',
                    left: width * i + gutter * i
                });
                this.$grid.append($column);
            }
            this.$columns = jQuery('.' + this.options.columnClass);
            this.calculateShortest();
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
            } else if (this.windowWidth <= 767 && this.windowWidth > 480) {
                this.layout = 'ereader';
            } else if (this.windowWidth <= 979 && this.windowWidth > 767) {
                this.layout = 'tablet-vertical';
            } else if (this.windowWidth <= 1199 && this.windowWidth > 979) {
                this.layout = 'default';
            } else {
                this.layout = 'desktop';
            }
            this.columnNumber = this.options.layout.columnNumber[this.layout];
            this.options.layout.columnWidth = (this.gridWidth - (this.columnNumber - 1) * this.gutter) / this.columnNumber;
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

jQuery(document).ready(function() {
    jQuery('#content').thread({
        blockClass: 'article'
    });
});