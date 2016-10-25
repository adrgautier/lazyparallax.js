(function ($) {
    $.fn.lazyparallax = function (params) {

        /* variables */
        var options = $.extend({
                'speed': 0,
                'fade': 0,
                'context': $(window),
                'loadingClass': 'loading',
                'maxTimeout': 1000,
                'inCondition': function(){return true;},
                'responsive': true
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
                    var $elem = value.elem,
                        $content = value.content,
                        properties = value.properties;

                    var transY = Number((context.position - properties.position) * options.speed);

                    $content.css({
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%',
                        'transition': options.fade + 'ms opacity',
                        'opacity': '1',
                        'transform': 'translate(-50%,calc(-50% - ' + transY + 'px)) scale( ' + properties.scale + ' )',
                        '-ms-transform': 'translate(-50%,calc(-50% - ' + transY + 'px)) scale( ' + properties.scale + ' )',
                        '-webkit-transform': 'translate(-50%,calc(-50% - ' + transY + 'px)) scale( ' + properties.scale + ' )'
                    });
                });
            },
            scale = function(){
                $.each(elems, function (index, value) {
                    var $elem = value.elem,
                        $content = value.content,
                        properties = value.properties;

                    $content.css({
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%',
                        'transition': options.fade + 'ms opacity',
                        'opacity': '1',
                        'transform': 'translate(-50%,-50%) scale( ' + properties.scale + ' )',
                        '-ms-transform': 'translate(-50%,-50%) scale( ' + properties.scale + ' )',
                        '-webkit-transform': 'translate(-50%,-50%) scale( ' + properties.scale + ' )'
                    });
                });
            };


        this.each(function () {
            var $elem = $(this),
                $content = null;

            /* lazyLoad if not already loaded */
            if ($elem.data('loaded') !== true) {

                $elem.data('loaded', true);

                /* if the content has not been lazy-loaded and has a src, proceed with loading */
                if ($elem.data('img') !== null || $elem.data('iframe') !== null || $elem.data('video') !== null) {

                    /* add a new deferred for this image to the array */
                    var dfd = new $.Deferred();
                    dfdList.push(dfd);

                    /* add loading class for CSS convenience */
                    $elem.addClass(options.loadingClass);

                    if ($elem.data('img') !== undefined) {

                        /* create an anonymous Image and define its load callback */
                        var img = new Image();
                        $content = $(img);

                        $content.on("load", function () {

                            /* add image into elem */
                            $elem.append($content);

                            /* remove CSS loading class */
                            $elem.removeClass(options.loadingClass);

                            /* resolve this image's deferred */
                            dfd.resolve();

                            options.imgLoadedCallback($content, $elem);

                        });

                        $content.on("error", function () {
                            $elem.trigger('error');
                        });

                        /* initiate loading of this image by setting its src prop.
                         load callback will execute when loading is complete */
                        img.src = $elem.data('img');

                        $content.realHeight = function(){
                            return this[0].height;
                        }

                        $content.realWidth = function(){
                            return this[0].width;
                        }
                    }

                    if ($elem.data('iframe') !== undefined && $content === null) {

                        /* create an iframe */
                        var ifrm = document.createElement("IFRAME");
                        $content = $(ifrm);

                        $content.on("load", function () {

                            /* remove CSS loading class */
                            $elem.removeClass(options.loadingClass);

                            /* resolve this image's deferred */
                            dfd.resolve();
                        });

                        /* add iframe into elem */
                        $elem.append($content);

                        /* init */
                        ifrm.src = $elem.data('iframe');

                        $content.realHeight = function(){
                            return this[0].height;
                        }

                        $content.realWidth = function(){
                            return this[0].hidth;
                        }

                    }

                    if ($elem.data('video') !== undefined && $content === null) {

                        /* create a video tag */
                        var vid = document.createElement("VIDEO");
                        $content = $(vid);

                        $content.on("load", function () {

                            /* remove CSS loading class */
                            $elem.removeClass(options.loadingClass);

                            /* resolve this image's deferred */
                            dfd.resolve();
                        });

                        /* add video into elem */
                        $elem.append($content);

                        /* init */
                        vid.autoplay = true;
                        vid.loop = true;
                        vid.src = $elem.data('video');

                        $content.realHeight = function(){
                            return this[0].videoHeight;
                        }

                        $content.realWidth = function(){
                            return this[0].videoWidth;
                        }

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
                        'transition': options.fade + 'ms opacity',
                        'opacity': '0',
                        'transform': 'translate(-50%,-50%)',
                        '-ms-transform': 'translate(-50%,-50%)',
                        '-webkit-transform': 'translate(-50%,-50%)'
                    });

                    elems.push({
                        'elem': $elem,
                        'content': $content,
                        'properties': {}
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

                $.each(elems, function (index, value) {
                    var $elem = value.elem,
                        $content = value.content,
                        properties = value.properties;
                    if (options.inCondition()) {

                        properties.position = $elem.offset().top + $elem.height() / 2;
                        properties.height = ((Math.abs(options.speed) * context.height) + (Math.abs(1 + options.speed) * $elem.height()));
                        properties.scale = 1;

                        var dHeight = properties.height - $content.realHeight(),
                            dWidth = $elem.width() - $content.realWidth(),
                            vScale = 1 + (dHeight + 1) / $content.realHeight(),
                            hScale = 1 + (dWidth + 1) / $content.realWidth();

                        if (vScale > hScale) {
                            properties.scale = vScale;
                        }
                        else {
                            properties.scale = hScale;
                        }
                    }else if(options.responsive == true){
                        properties.scale = 1;

                        var dHeight = $elem.height() - $content.realHeight(),
                            dWidth = $elem.width() - $content.realWidth(),
                            vScale = 1 + (dHeight + 1) / $content.realHeight(),
                            hScale = 1 + (dWidth + 1) / $content.realWidth();

                        if (vScale > hScale) {
                            properties.scale = vScale;
                        }
                        else {
                            properties.scale = hScale;
                        }
                    }
                    else{
                        $content.removeAttr('style');
                    }
                });
                /* force scroll */
                options.context.trigger('scroll');
            })
            .on('scroll', function () {
                context.position = options.context.scrollTop() + context.height / 2;
                if (options.inCondition()) {
                    move();
                }else if(options.responsive == true){
                    scale();
                }
            });

        return this;
    };
}(jQuery));