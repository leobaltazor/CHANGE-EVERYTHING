$(function() {
    // Custom JS
    $(".slide-text__wrapper").slick({
        centerMode: true,
        centerPadding: "0px",
        slidesToShow: 1,
        variableWidth: true
    });
    $(".gallery__gallery-slider").slick({
        speed: 700,
        autoplay: true,
        autoplaySpeed: 2000
    });
    $(".gallery__gallery-slider").on("beforeChange", function(
        event,
        slick,
        currentSlide,
        nextSlide
    ) {
        var bg = $(slick.$slides[nextSlide])
            .find("img")
            .data("color");
        $(".gallery").css("background-color", bg);
    });
    $(".ipadblock__ipad").slick({});

    var sw = new ScrollWatch({
        watchOnce: true,
        watch: "*"
    });
});
