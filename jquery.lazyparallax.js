(function ($) {
    $.fn.lazyparallax = function (params) {

        /* variables */
        var options = $.extend({
                'speed': 0,
                'animate': 0,
                'context': $(window),
                'mincontextwidth': 0,
                'loadingClass': 'loading',
                'maxTimeout': 1000
            }, params),
            context = {
                'height': Number(),
                'width': Number(),
                'position': Number()
            },
            elems = [],
            dfdList = [],
            move = function () {
                $.each(elems, function (index, value) {
                    var $elem = $(value.elem),
                        $content = $(value.content),
                        elem = {};
                    if (context.width > options.mincontextwidth) {
                        $content.css({
                            'position': 'absolute',
                            'top': '50%',
                            'left': '50%',
                            'min-width': '100%',
                            'transition': options.animate + 'ms opacity',
                            'opacity': '1'
                        });

                        elem.position = $elem.offset().top + $elem.height() / 2;
                        elem.height = ((Math.abs(options.speed) * context.height) + (Math.abs(1 + options.speed) * $elem.height()));
                        
                        var transY = Number((context.position - elem.position) * options.speed);
                        $content.css({
                            'transform': 'translate(-50%,calc(-50% - ' + transY + 'px))',
                            '-ms-transform': 'translate(-50%,calc(-50% - ' + transY + 'px))',
                            '-webkit-transform': 'translate(-50%,calc(-50% - ' + transY + 'px))',
                            'min-height': elem.height + 'px'
                        });
                    } else {
                        $content.removeAttr('style');
                    }
                });
            };


        this.each(function () {
            var $elem = $(this),
                $content = null;

            /* lazyLoad if not already loaded */
            if ($elem.data('loaded') !== true) {

                $elem.data('loaded', true);

                /* if the content has not been lazy-loaded and has a src, proceed with loading */
                if ($elem.data('img') !== null || $elem.data('iframe') !== null) {

                    /* add a new deferred for this image to the array */
                    var dfd = new $.Deferred();
                    dfdList.push(dfd);

                    /* add loading class for CSS convenience */
                    $elem.addClass(options.loadingClass);

                    if ($elem.data('img') !== undefined) {

                        /* create an anonymous Image and define its load callback */
                        var img = new Image();
                        $content = $(img);

                        $content.load(function () {

                            /* add image into elem */
                            $elem.append($content);

                            /* remove CSS loading class */
                            $elem.removeClass(options.loadingClass);

                            /* resolve this image's deferred */
                            dfd.resolve();
                        });

                        $content.error(function () {
                            $elem.trigger('error');
                        });

                        /* initiate loading of this image by setting its src prop.
                            load callback will execute when loading is complete */
                        img.src = $elem.data('img');
                    }

                    if ($elem.data('iframe') !== undefined && $content === null) {

                        /* create an iframe */
                        var ifrm = document.createElement("IFRAME");
                        $content = $(ifrm);

                        $content.load(function () {

                            /* remove CSS loading class */
                            $elem.removeClass(options.loadingClass);

                            /* resolve this image's deferred */
                            dfd.resolve();
                        });

                        /* add iframe into elem */
                        $elem.append($content);

                        /* init */
                        $content.attr('src', $elem.data('iframe'));

                    }


                    /* set css ... */
                    $elem.css({
                        'position': 'relative',
                        'overflow': 'hidden'
                    });

                    $content.css({
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%',
                        'min-width': '100%',
                        'transform': 'translate(-50%,-50%)',
                        '-ms-transform': 'translate(-50%,-50%)',
                        '-webkit-transform': 'translate(-50%,-50%)',
                        'transition': options.animate + 'ms opacity',
                        'opacity': '0'
                    });

                    elems.push({
                        'elem': $elem,
                        'content': $content
                    });

                }
            }
        });

        /* add timeout capability to returned deferred */
        var loadOrTimeout = new $.Deferred();

        /* when all images have loaded, resolve the returned deferred */
        $.when.apply(null, dfdList).then(function () {
            loadOrTimeout.resolve();
        });

        /* alternatively, if a maxTimeout is defined, resolve the returned deferred after the specified timeout has expired */
        if (typeof (options.maxTimeout) === "number") {
            setTimeout(function () {
                loadOrTimeout.resolve();
            }, options.maxTimeout);
        }

        /* deferred that will resolve after all images have loaded or after a specified timeout has expired */
        loadOrTimeout.then(function () {

            /* init parallax */
            options.context.trigger('resize');

        });

        /* eventlisteners */
        options.context
            .on('resize', function () {
                context.height = options.context.height();
                context.width = options.context.width();
                /* force scroll */
                options.context.trigger('scroll');
            })
            .on('scroll', function () {
                context.position = options.context.scrollTop() + context.height / 2;
                move();
            });

        return this;
    };
}(jQuery));
