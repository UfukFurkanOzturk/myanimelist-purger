// ==UserScript==
// @name        myanimelist-purger
// @namespace   Violentmonkey Scripts
// @match       https://myanimelist.net/*
// @grant       GM_addStyle
// @version     1.0
// @author      Ufuk Furkan Öztürk
// @description 3/31/2024
// ==/UserScript==

const URL = window.location.toString();
const listType = URL[24] == "a" ? "anime" : URL[24] == "m" ? "manga" : "err";
let idArray = [];

listType != "err" &&
  window.addEventListener("load", (event) => {
    const elements = document.getElementsByClassName("link sort");
    let Links = [];

    for (var i = 0; i < elements.length; i += 2) {
      elements[i].href.toString().includes("?status=")
        ? ""
        : Links.push(elements[i].href.toString());
    }

    var reg = /^\d+$/;
    Links.forEach((link) => {
      var slashCount = 0;
      var idBuilder = "";

      for (let i = 0; i < link.length; i++) {
        var char = link.charAt(i);
        if (char === "/") {
          slashCount += 1;
        }
        if (reg.test(char) === true && slashCount < 5) {
          idBuilder += char;
        }
      }

      idArray.push(idBuilder);
    });

    // one button ui, cause who needs more
    let btn = document.createElement("BUTTON");
    var btntxt = document.createTextNode("le purge");
    btn.classList.add("purger");
    btn.appendChild(btntxt);
    var clicked = false;
    btn.onclick = async () => {
      if (clicked === false) {
        clicked = true;
        await startPurge();
      } else {
        console.log("no");
      }
    };
    document.body.appendChild(btn);

    GM_addStyle(
      ".purger { font-size: 99px !important; position: fixed !important; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1100; }"
    );

    async function startPurge() {
      if (idArray.length == 0) {
        btn.innerHTML = "no entry found";
        return;
      }
      for (i = 0; i <= idArray.length; i++) {
        await removeEntry(idArray[i], listType);
        await sleep(250);
      }
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // put your csrf token inside body if needed
    // you can get it by deleting an entry and checking the request in dev tools' network tab
    async function removeEntry(id, listType) {
      const elementURL = "https://myanimelist.net/ownlist/" + listType + "/";
      const res = await fetch(elementURL + id + "/delete", {
        credentials: "include",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "no-cache",
        },
        referrer: `${elementURL}edit?hideLayout`,
        body: "",
        method: "POST",
        mode: "cors",
      });
      res.status == 200 && console.log("purged " + id);
    }
  });
