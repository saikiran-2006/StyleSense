gsap.to("#mark span", {
    x: "-=400%",
    duration: 25,
    repeat: -1,
    ease: "none",
});

gsap.registerPlugin(ScrollTrigger);

var tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#about",
        start: "top 15%",
        end: "100% 10%",
        scrub: true,
        markers: false,
        pin: true,
    },
});
tl.to(".a",{
    color: "#000000",
    opacity:1,
    stagger:0.3

})
tl.to("#left",{
    scale: 0.5,
},"a")

