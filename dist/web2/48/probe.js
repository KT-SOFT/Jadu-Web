(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // vehicle/37/auth-config.js
  var firebaseConfig = Object.freeze({
    "apiKey": "AIzaSyBEzuAoC0WBnJp-HghCZ-xPuUfDCDMlJ-A",
    "authDomain": "jadu-web.firebaseapp.com",
    "projectId": "jadu-web",
    "appId": "1:511414741782:web:e2e1ed4fd5cb619a63be37"
  });

  // verification/car-state100/probe-source.mjs
  var show = (id, text) => document.getElementById(id).textContent = text;
  var failed = (error) => "\uCC28\uB2E8 / " + ((error == null ? void 0 : error.name) || "Error");
  for (const [name, id] of [["localStorage", "local"], ["sessionStorage", "session"]]) {
    try {
      const storage = window[name], count = Number(storage.getItem("jadu-probe48") || 0) + 1;
      storage.setItem("jadu-probe48", String(count));
      show(id, "\uC0AC\uC6A9 \uAC00\uB2A5 / " + count + "\uD68C");
    } catch (error) {
      show(id, failed(error));
    }
  }
  var _a;
  try {
    const count = Number(((_a = history.state) == null ? void 0 : _a.jaduProbe48) || 0) + 1;
    history.replaceState({ ...history.state, jaduProbe48: count }, "");
    show("history", count + "\uD68C");
  } catch (error) {
    show("history", failed(error));
  }
  try {
    const request = window.indexedDB.open("jadu-probe48", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("checks");
    request.onerror = () => show("database", failed(request.error));
    request.onblocked = () => show("database", "\uC0AC\uC6A9 \uB300\uAE30");
    request.onsuccess = () => {
      const db = request.result;
      try {
        const transaction = db.transaction("checks", "readwrite"), store = transaction.objectStore("checks"), read = store.get("visits");
        let count;
        read.onsuccess = () => {
          count = Number(read.result || 0) + 1;
          store.put(count, "visits");
        };
        transaction.oncomplete = () => {
          show("database", "\uC0AC\uC6A9 \uAC00\uB2A5 / " + count + "\uD68C");
          db.close();
        };
        transaction.onerror = () => {
          show("database", failed(transaction.error));
          db.close();
        };
      } catch (error) {
        show("database", failed(error));
        db.close();
      }
    };
  } catch (error) {
    show("database", failed(error));
  }
  (async () => {
    var _a2;
    try {
      const [appSDK, sdk] = await Promise.all([import("https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js"), import("https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js")]);
      const app = appSDK.getApps().find((item) => item.name === "jadu-web-auth") || appSDK.initializeApp(firebaseConfig, "jadu-web-auth");
      const auth = sdk.getAuth(app);
      await auth.authStateReady();
      const type = ((_a2 = auth._getPersistenceType) == null ? void 0 : _a2.call(auth)) || "unknown";
      show("auth", type + " / " + (auth.currentUser ? "\uC5F0\uACB0 \uBCF5\uC6D0\uB428" : "\uC5F0\uACB0 \uC5C6\uC74C"));
    } catch (error) {
      show("auth", "\uD655\uC778 \uC624\uB958 / " + (error.code || error.name || "Error"));
    }
  })();
  var API = "https://yt.chocolatemoo53.com";
  function checkFile(format, id) {
    return new Promise((resolve) => {
      const media = document.createElement("audio");
      if (!format || !media.canPlayType(format.type)) {
        show(id, "\uC9C0\uC6D0 \uD615\uC2DD \uC5C6\uC74C");
        resolve();
        return;
      }
      const url = new URL(format.url, API), expected = new URL(API);
      if (url.protocol !== expected.protocol || !(url.hostname === expected.hostname || url.hostname.endsWith(".chocolatemoo53.com"))) {
        show(id, "\uC8FC\uC18C \uD655\uC778 \uD544\uC694");
        resolve();
        return;
      }
      const start = performance.now();
      show(id, "\uC900\uBE44 \uC911");
      let ended = false;
      const finish = (message) => {
        if (ended) return;
        ended = true;
        clearTimeout(timer);
        media.onloadedmetadata = media.onerror = null;
        media.removeAttribute("src");
        media.load();
        show(id, message);
        resolve();
      };
      const timer = setTimeout(() => finish("20\uCD08 \uCD08\uACFC"), 2e4);
      media.preload = "metadata";
      media.onloadedmetadata = () => finish(((performance.now() - start) / 1e3).toFixed(2) + "\uCD08 / \uC900\uBE44\uB428");
      media.onerror = () => {
        var _a2;
        return finish(((performance.now() - start) / 1e3).toFixed(2) + "\uCD08 / \uC5F0\uACB0 \uC624\uB958 " + (((_a2 = media.error) == null ? void 0 : _a2.code) || ""));
      };
      media.src = url.href;
      media.load();
    });
  }
  document.getElementById("audio-check").addEventListener("click", async () => {
    const button = document.getElementById("audio-check"), controller = new AbortController(), start = performance.now();
    button.disabled = true;
    show("info", "\uC74C\uC6D0 \uC8FC\uC18C \uC900\uBE44 \uC911");
    show("mp4", "-");
    show("webm", "-");
    const timer = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(API + "/api/v1/videos/M7lc1UVf-VE?local=true", { credentials: "omit", cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (data.error) throw new Error("\uC74C\uC6D0 \uC11C\uBC84 \uC751\uB2F5 \uC624\uB958");
      clearTimeout(timer);
      show("info", ((performance.now() - start) / 1e3).toFixed(2) + "\uCD08 / \uC8FC\uC18C \uBC1B\uC74C");
      const formats = data.adaptiveFormats || [];
      await Promise.all([checkFile(formats.find((item) => String(item.itag) === "140") || formats.find((item) => String(item.type).startsWith("audio/mp4")), "mp4"), checkFile(formats.find((item) => String(item.itag) === "251") || formats.find((item) => String(item.type).startsWith("audio/webm")), "webm")]);
    } catch (error) {
      show("info", ((performance.now() - start) / 1e3).toFixed(2) + "\uCD08 / " + (error.name === "AbortError" ? "\uC8FC\uC18C \uC5F0\uACB0 \uC2DC\uAC04 \uCD08\uACFC" : error.message === "Failed to fetch" ? "\uC74C\uC6D0 \uC11C\uBC84 \uC5F0\uACB0 \uC2E4\uD328" : error.message));
    } finally {
      clearTimeout(timer);
      button.disabled = false;
    }
  });
})();
