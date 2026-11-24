if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion:reduce)").matches
) {
  document.documentElement.classList.add("js");
}

(() => {
  const w = document.querySelector(".hero-img"),
    r = w.querySelector(".rig");
  const dx = Math.max(innerWidth - w.getBoundingClientRect().left + 40, 300),
    R = (r.offsetWidth * 85) / 1100,
    T = Math.min(3.4, Math.max(2.4, dx / 450));
  w.style.setProperty("--dx", dx + "px");
  w.style.setProperty("--spin", ((dx / R) * 180) / Math.PI + "deg");
  w.style.setProperty("--T", T + "s");
  w.style.setProperty("--rx", Math.ceil(dx / 84) * 84 + "px");
  w.style.setProperty("--n", 2 * Math.round(T / 0.22));
  const im = r.querySelector("img");
  r.querySelectorAll(".wh b").forEach(
    (b) => (b.style.backgroundImage = "url(" + im.src + ")"),
  );
})();

const $ = (s) => document.querySelector(s);
/* mobile menu */
const burger = $("#burger"),
  navEl = $("#nav");
burger.addEventListener("click", () => {
  const o = navEl.classList.toggle("open");
  burger.setAttribute("aria-expanded", o);
  burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
});
navEl.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    navEl.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
});
/* active link while scrolling */
const links = [...navEl.querySelectorAll('a[href^="#"]:not(.btn)')],
  secs = links.map((a) => document.querySelector(a.getAttribute("href")));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) =>
            a.classList.toggle(
              "on",
              a.getAttribute("href") === "#" + e.target.id,
            ),
          );
        }
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  secs.forEach((s) => s && io.observe(s));
}
/* request form. TODO: send these values to your dispatch system or inbox. */
const rf = $("#rf");
rf.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = {
    n: $("#n").value.trim(),
    p: $("#p").value.replace(/[^\d+]/g, ""),
    s: $("#s").value,
    l: $("#l").value.trim(),
  };
  const bad = {
    n: v.n.length < 2,
    p: v.p.replace(/\D/g, "").length < 10,
    s: !v.s,
    l: v.l.length < 3,
  };
  Object.keys(bad).forEach((k) => $("#g-" + k).classList.toggle("bad", bad[k]));
  const first = Object.keys(bad).find((k) => bad[k]);
  if (first) {
    $("#" + first).focus();
    return;
  }
  rf.style.display = "none";
  const ok = $("#ok");
  ok.style.display = "block";
  $("#ok-t").textContent =
    "Thanks, " +
    v.n.split(" ")[0] +
    ". This form is not connected to dispatch yet, so for roadside help right now please call us directly.";
  ok.focus();
});
rf.addEventListener("input", (e) => {
  const g = e.target.closest('[id^="g-"]');
  if (g) g.classList.remove("bad");
});

/* scroll reveals: cards fade in, then their contents follow */
if (document.documentElement.classList.contains("js")) {
  const sel =
    ".hero .tag,.hero .live,.hero h1,.ticks li,.cta,.cta-note,.eyebrow,section h2,.lead,.note,.service-card,.story p,.pill,.story-gallery figure,.f,.step,.area,.cl li,.form,.band .container>div,.conn";
  const seen = new Map();
  let n = 0;
  const rvs = [...document.querySelectorAll(sel)];
  rvs.forEach((el) => {
    el.classList.add("rv");
    if (el.closest(".hero")) {
      el.style.setProperty("--d", n++ * 110 + 200 + "ms");
      return;
    }
    const k = seen.get(el.parentNode) || 0;
    seen.set(el.parentNode, k + 1);
    el.style.setProperty("--d", Math.min(k, 7) * 110 + "ms");
  });
  const rio = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          rio.unobserve(e.target);
        }
      }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  rvs.forEach((el) => rio.observe(el));
}
const hd = document.querySelector("header.hd");
addEventListener(
  "scroll",
  () => hd.classList.toggle("scrolled", scrollY > 10),
  { passive: true },
);

/* the route fills in yellow behind a glowing dot and lights each icon as it arrives */
(() => {
  const fs = document.querySelector(".fs");
  if (!fs || !document.documentElement.classList.contains("js")) return;
  const svg = fs.querySelector(".conn"),
    tr = [...svg.querySelectorAll(".tr")],
    pr = [...svg.querySelectorAll(".pr")],
    dot = fs.querySelector(".dot"),
    ic = [...fs.querySelectorAll(".f")];
  const S = [
    [172, 52, 215, 52, 225, 92, 250, 92, 285, 92, 300, 44, 328, 44],
    [428, 44, 465, 44, 480, 74, 500, 74, 525, 74, 545, 46, 572, 46],
    [678, 46, 715, 46, 725, 92, 750, 92, 785, 92, 800, 44, 822, 44],
  ];
  const prog = [0, 0, 0],
    len = [0, 0, 0];
  function build() {
    const W = fs.clientWidth;
    if (!W) return;
    svg.setAttribute("viewBox", "0 0 " + W + " 96");
    S.forEach((s, i) => {
      const q = s.map((v, k) => (k % 2 ? v : +((v * W) / 1000).toFixed(1)));
      const d =
        "M" +
        q[0] +
        " " +
        q[1] +
        "C" +
        q.slice(2, 8).join(" ") +
        "C" +
        q.slice(8).join(" ");
      tr[i].setAttribute("d", d);
      pr[i].setAttribute("d", d);
      len[i] = pr[i].getTotalLength();
      pr[i].style.strokeDasharray = len[i];
      pr[i].style.strokeDashoffset = len[i] * (1 - prog[i]);
    });
  }
  build();
  addEventListener("resize", build);
  const ping = (i) => {
    ic[i].classList.add("hit");
    setTimeout(() => ic[i].classList.remove("hit"), 950);
  };
  let seg = 0,
    t0 = null;
  const wait = (ms) => setTimeout(() => requestAnimationFrame(frame), ms);
  function frame(ts) {
    if (innerWidth <= 900) {
      wait(1000);
      return;
    }
    if (t0 === null) {
      t0 = ts;
      pr[seg].style.opacity = 1;
      if (seg === 0) ping(0);
    }
    const t = Math.min((ts - t0) / 1500, 1),
      e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    prog[seg] = e;
    pr[seg].style.strokeDashoffset = len[seg] * (1 - e);
    const pt = pr[seg].getPointAtLength(e * len[seg]);
    dot.style.opacity = 1;
    dot.style.transform =
      "translate(" + (pt.x - 8) + "px," + (pt.y - 8) + "px)";
    if (t < 1) {
      requestAnimationFrame(frame);
      return;
    }
    ping(seg + 1);
    seg++;
    t0 = null;
    if (seg < pr.length) {
      wait(400);
      return;
    }
    dot.style.opacity = 0;
    setTimeout(() => {
      pr.forEach((x) => (x.style.opacity = 0));
      setTimeout(() => {
        prog.fill(0);
        build();
        seg = 0;
        requestAnimationFrame(frame);
      }, 800);
    }, 2600);
  }
  const o = new IntersectionObserver(
    (es) => {
      if (es[0].isIntersecting) {
        o.disconnect();
        setTimeout(() => requestAnimationFrame(frame), 1500);
      }
    },
    { threshold: 0.4 },
  );
  o.observe(fs);
})();

/* floating call button appears only when no other call button is on screen */
(() => {
  const f = document.querySelector(".fab");
  if (!f || !("IntersectionObserver" in window)) return;
  const on = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) =>
      e.isIntersecting ? on.add(e.target) : on.delete(e.target),
    );
    f.classList.toggle("off", on.size > 0);
  });
  document
    .querySelectorAll(".hero .cta,.band,#contact .form")
    .forEach((el) => io.observe(el));
})();

/* AndarAssist: rule-based FAQ bot built from the information on this page */
(() => {
  const cb = $("#cb"),
    fab = $("#cb-fab"),
    msgs = $("#cb-m"),
    chips = $("#cb-q"),
    form = $("#cb-f"),
    inp = $("#cb-i"),
    tip = $("#cb-tip");
  const CALL = { t: "Call 0919 170 0062", href: "tel:+639191700062" };
  const FORM = { t: "Request help online", go: "#contact" };
  const KB = [
    {
      w: 3,
      k: [
        "accident",
        "injur",
        "hurt",
        "fire",
        "smoke",
        "danger",
        "unsafe",
        "crash",
        "bleed",
      ],
      a: [
        "If anyone is hurt or in danger, call 911 first and move to a safe place if you can.",
        "Once everyone is safe, call us and we’ll get help moving.",
      ],
      act: [CALL],
    },
    {
      k: [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "kumusta",
      ],
      a: [
        "Hi, I’m AndarAssist. I can answer questions about our services, coverage, pricing and how it works.",
        "In an emergency, calling is fastest.",
      ],
      act: [CALL],
    },
    {
      k: [
        "service",
        "offer",
        "what do you do",
        "what can you",
        "help with",
        "provide",
      ],
      a: ["We help with four things:"],
      list: ["Towing", "Battery boosting", "Tire patching", "Tire replacement"],
      act: [CALL, FORM],
    },
    {
      w: 3,
      k: [
        "tow",
        "towing",
        "towed",
        "flatbed",
        "stuck",
        "broke down",
        "breakdown",
        "wont start",
        "won’t start",
      ],
      a: [
        "Yes, we offer towing. Tell us where you are and what happened, and we’ll send a verified responder.",
      ],
      act: [CALL, FORM],
    },
    {
      w: 3,
      k: ["battery", "boost", "jump", "dead"],
      a: [
        "We do battery boosting for a dead battery, so you can get moving again without a tow.",
      ],
      act: [CALL, FORM],
    },
    {
      w: 3,
      k: ["tire", "tyre", "flat", "patch", "puncture", "replace", "spare"],
      a: ["We offer tire patching and tire replacement, right where you are."],
      act: [CALL, FORM],
    },
    {
      k: [
        "where",
        "area",
        "cover",
        "province",
        "nlex",
        "slex",
        "manila",
        "luzon",
        "location",
        "city",
        "reach",
      ],
      a: [
        "We cover Metro Manila, NLEX, SLEX and Luzon provinces.",
        "Not sure if we reach you? Call 0919 170 0062 and we’ll confirm.",
      ],
      act: [CALL],
    },
    {
      k: [
        "open",
        "hour",
        "24/7",
        "24 7",
        "available",
        "schedule",
        "night",
        "holiday",
        "sunday",
        "weekend",
      ],
      a: ["Yes, we’re open 24/7 and a real person answers your call."],
      act: [CALL],
    },
    {
      w: 2,
      k: [
        "price",
        "pricing",
        "cost",
        "how much",
        "rate",
        "fee",
        "charge",
        "quote",
        "pay",
        "magkano",
      ],
      a: [
        "You’ll see the price up front, before we dispatch anyone.",
        "For a quote on your situation, call us or send a request with your location and what happened.",
      ],
      act: [CALL, FORM],
    },
    {
      k: [
        "how does",
        "how it works",
        "how do i",
        "process",
        "step",
        "book",
        "dispatch",
        "request",
      ],
      a: ["It takes three steps:"],
      list: [
        "Call or request online. Tell us where you are and what happened.",
        "We send a verified responder, and you see the price up front.",
        "Track your responder’s arrival live until help reaches you.",
      ],
      act: [CALL, FORM],
    },
    {
      k: [
        "track",
        "live",
        "eta",
        "arrive",
        "how long",
        "wait",
        "how fast",
        "minutes",
      ],
      a: [
        "You can follow your responder’s arrival in real time.",
        "I can’t promise an arrival time here, since it depends on where you are. Call us for an estimate.",
      ],
      act: [CALL],
    },
    {
      k: [
        "verified",
        "trust",
        "safe",
        "legit",
        "scam",
        "real",
        "responder",
        "driver",
      ],
      a: [
        "Every responder is verified, so you know who is coming to help you. You also see the cost before help is on the way.",
      ],
      act: [CALL],
    },
    {
      k: [
        "phone",
        "number",
        "call",
        "contact",
        "reach",
        "email",
        "talk",
        "human",
        "person",
        "agent",
      ],
      a: [
        "You can reach us 24/7 at 0919 170 0062, or send a request online and we’ll get back to you.",
      ],
      act: [CALL, FORM],
    },
    {
      k: ["thank", "thanks", "salamat", "ok", "okay", "bye"],
      a: [
        "You’re welcome. Stay safe on the road. We’re here 24/7 if you need us.",
      ],
      act: [CALL],
    },
  ];
  const FALLBACK = {
    a: [
      "I’m not sure about that one, and I don’t want to guess.",
      "A real person answers 24/7 at 0919 170 0062, or you can send a request online.",
    ],
    act: [CALL, FORM],
  };
  const CHIPS = [
    "Services",
    "Coverage",
    "How does it work?",
    "Pricing",
    "Open 24/7?",
    "I need help now",
  ];
  const NOW = {
    a: [
      "Call us now. A real person answers 24/7.",
      "If anyone is hurt or in danger, call 911 first.",
    ],
    act: [CALL, FORM],
  };

  const scroll = () => {
    msgs.scrollTop = msgs.scrollHeight;
  };
  function bubble(me, lines, list, act) {
    const b = document.createElement("div");
    b.className = "cb-b" + (me ? " me" : "");
    lines.forEach((l) => {
      const p = document.createElement("p");
      p.textContent = l;
      b.appendChild(p);
    });
    if (list) {
      const ul = document.createElement("ul");
      list.forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x;
        ul.appendChild(li);
      });
      b.appendChild(ul);
    }
    if (act) {
      const d = document.createElement("div");
      d.className = "cb-a";
      act.forEach((x) => {
        let el;
        if (x.href) {
          el = document.createElement("a");
          el.href = x.href;
        } else {
          el = document.createElement("button");
          el.type = "button";
          el.addEventListener("click", () => {
            close();
            const t = document.querySelector(x.go);
            if (t) {
              t.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                const n = $("#n");
                if (n) n.focus({ preventScroll: true });
              }, 700);
            }
          });
        }
        el.textContent = x.t;
        d.appendChild(el);
      });
      b.appendChild(d);
    }
    msgs.appendChild(b);
    scroll();
  }
  function answer(q) {
    const t = " " + q.toLowerCase().replace(/[^a-z0-9\/’' ]/g, " ") + " ";
    if (/\b(i need help now|need help now|emergency|urgent)\b/.test(t))
      return NOW;
    let best = null,
      top = 0;
    KB.forEach((e) => {
      let s = 0;
      e.k.forEach((k) => {
        if (
          new RegExp(
            "[ ]" +
              k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
              (k.length <= 3 ? "[ ]" : ""),
          ).test(t)
        )
          s += e.w || 1;
      });
      if (s > top) {
        top = s;
        best = e;
      }
    });
    return best || FALLBACK;
  }
  let busy = false;
  function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    busy = true;
    bubble(true, [q]);
    const ty = document.createElement("div");
    ty.className = "cb-t";
    ty.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(ty);
    scroll();
    const r = answer(q);
    setTimeout(
      () => {
        ty.remove();
        bubble(false, r.a, r.list, r.act);
        busy = false;
      },
      650 + Math.min(r.a.join("").length * 4, 700),
    );
  }
  CHIPS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => ask(c));
    chips.appendChild(b);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = inp.value;
    inp.value = "";
    ask(v);
  });
  let greeted = false;
  function open() {
    cb.classList.add("open");
    fab.setAttribute("aria-expanded", "true");
    tip.hidden = true;
    if (!greeted) {
      greeted = true;
      bubble(
        false,
        ["Hi, I’m AndarAssist. What roadside help do you need?"],
        null,
        [CALL],
      );
    }
    setTimeout(() => {
      if (innerWidth > 600) inp.focus();
    }, 300);
  }
  function close() {
    cb.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
  }
  fab.addEventListener("click", () =>
    cb.classList.contains("open") ? close() : open(),
  );
  $("#cb-x").addEventListener("click", () => {
    close();
    fab.focus();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cb.classList.contains("open")) {
      close();
      fab.focus();
    }
  });
  setTimeout(() => {
    if (!cb.classList.contains("open") && !greeted) {
      tip.hidden = false;
      setTimeout(() => {
        tip.hidden = true;
      }, 7000);
    }
  }, 6000);
})();
