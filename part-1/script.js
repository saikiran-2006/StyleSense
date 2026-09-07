Shery.imageEffect("#back", {
  style: 5,
  config: {
    a: { value: 2, range: [0, 30] },
    b: { value: -0.88, range: [-1, 1] },
    zindex: { value: -9996999, range: [-9999999, 9999999] },
    aspect: { value: 1.5940366972477065 },
    ignoreShapeAspect: { value: false },
    shapePosition: { value: { x: 0, y: 0 } },
    shapeScale: { value: { x: 0.5, y: 0.5 } },
    shapeEdgeSoftness: { value: 0, range: [0, 0.5] },
    shapeRadius: { value: 0, range: [0, 2] },
    currentScroll: { value: 0 },
    scrollLerp: { value: 0.07 },
    gooey: { value: true },
    infiniteGooey: { value: true },
    growSize: { value: 4, range: [1, 15] },
    durationOut: { value: 1, range: [0.1, 5] },
    durationIn: { value: 1, range: [0.1, 5] },
    displaceAmount: { value: 0.5 },
    masker: { value: true },
    maskVal: { value: 1.15, range: [1, 5] },
    scrollType: { value: 0 },
    geoVertex: { range: [1, 64], value: 1 },
    noEffectGooey: { value: true },
    onMouse: { value: 0 },
    noise_speed: { value: 0.38, range: [0, 10] },
    metaball: { value: 0.2, range: [0, 2], _gsap: { id: 3 } },
    discard_threshold: { value: 0.5, range: [0, 1] },
    antialias_threshold: { value: 0.01, range: [0, 0.1] },
    noise_height: { value: 0.35, range: [0, 2] },
    noise_scale: { value: 14.5, range: [0, 100] },
  },
  gooey: true,
});

var elems = document.querySelectorAll(".elem");
elems.forEach((elem) => {
  var h1 = elem.querySelectorAll("h1");
  var index = 0;

  document.querySelector("#main").addEventListener("click", () => {
    gsap.to(h1[index], {
      top: "-=100%",
      duration: 1,
      ease: "power2.inOut",
      onComplete: function () {
        gsap.set(this._targets[0], { top: "100%" });
      },
    });

    index === h1.length - 1 ? (index = 0) : index++;
    gsap.to(h1[index], {
      top: "-=100%",
      duration: 1,
      ease: "power2.inOut",
    });
  });
});


document.querySelector("#herol button").addEventListener("mouseenter",()=>{
  gsap.to("#herol button",{
    y:-10,
    duration:0.3,
    scale:1.01,
    ease:"power2.out"
  })

  gsap.to("#herol button h4",{
    y:-10,
    duration:0.3,
    scale:1.01,
    ease:"power2.out"
  })

})

document.querySelector("#herol button").addEventListener("mouseleave",()=>{
  gsap.to("#herol button",{
    y:0,
    duration:0.3,
    scale:1,
    ease:"power2.out"
  })

  gsap.to("#herol button h4",{
    y:0,
    duration:0.3,
    scale:1,
    ease:"power2.out"
  })
})

 gsap.to("#copy span", {
    x: "-=400%",
    duration: 25,
    repeat: -1,
    ease: "none",
});


