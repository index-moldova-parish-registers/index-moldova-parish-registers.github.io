/* Index du fonds 211 (registres paroissiaux de Bessarabie), présenté comme
   Arhive Moldova (app/arhive_moldova.html) : une ligne par village et par
   dossier, filtres uezd / église / années.
   Données : fonds211.json {D: dossiers, L: lignes}, écrit par
   genere_site211.py (2026-10-14). */
(function () {
  "use strict";
  var FILM = "https://www.familysearch.org/search/film/";
  // lien direct vers l'image (2026-10-17) ; groupId = collection « Moldova,
  // Church Books, 1811-1936 » ; i = rang dans la bobine, base 0
  var ARK = "https://www.familysearch.org/ark:/61903/3:1:";
  function image(ark, vue) { return ARK + ark + "?i=" + Math.max(vue - 1, 0) + "&groupId=1943763"; }
  var LISTE = "https://www.familysearch.org/records/images/search-results?imageGroupNumbers=";
  var PAS = 100;
  var T = window.TEXTES, UEZD = window.UEZD;
  var D = [], L = [], V = {};
  var q = document.getElementById("q"), bouton = document.getElementById("bouton");
  var res = document.getElementById("resultats"), compte = document.getElementById("compte");
  var vide = document.getElementById("etat-vide");
  var plus = document.getElementById("plus");
  var fU = document.getElementById("f-uezd"), fE = document.getElementById("f-eglise");
  var fDe = document.getElementById("f-de"), fA = document.getElementById("f-a");
  var courant = [], montre = 0;

  /* Une saisie en cyrillique (russe, ukrainien) est translitteree comme sur le
     site des catagrafii (chantiers/indexeur_fs/site/indexeur.js), 2026-10-25. */
  var CYR = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "io", "ж": "j",
    "з": "z", "и": "i", "й": "i", "к": "c", "л": "l", "м": "m", "н": "n", "о": "o",
    "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "t",
    "ч": "c", "ш": "s", "щ": "st", "ъ": "", "ы": "i", "ь": "", "э": "a", "ю": "iu",
    "я": "ia", "і": "i", "ї": "i", "є": "ie", "ґ": "g", "ӂ": "j"
  };
  function estLettre(c) { return !!c && c.toLowerCase() !== c.toUpperCase(); }

  /* Cyrillique -> latin dans l'orthographe roumaine (э = ă sauf en tete de
     mot, ь final = i, к/г devant е/и = ch/gh) ; le reste passe tel quel. */
  function translit(s) {
    var out = "", n = s.length;
    for (var i = 0; i < n; i++) {
      var lo = s.charAt(i).toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(CYR, lo)) { out += s.charAt(i); continue; }
      var nx = i + 1 < n ? s.charAt(i + 1).toLowerCase() : "";
      var pv = i ? s.charAt(i - 1).toLowerCase() : "";
      var r = CYR[lo];
      if (lo === "к") r = (nx === "е" || nx === "и") ? "ch" : "c";
      else if (lo === "г") r = (nx === "е" || nx === "и") ? "gh" : "g";
      else if (lo === "э") r = estLettre(pv) ? "a" : "e";
      else if (lo === "ь") r = estLettre(nx) ? "" : "i";
      out += r;
    }
    return out;
  }

  function fold(s) {
    return translit(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }
  function txt(p, s) { p.appendChild(document.createTextNode(s)); }
  function pad(n) { n = String(n); while (n.length < 9) n = "0" + n; return n; }
  function lien(href, s) {
    var a = el("a", "", s); a.href = href; a.target = "_blank"; a.rel = "noopener"; return a;
  }

  fetch("fonds211.json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) {
    j = [j];
    D = j[0].D.map(function (d) {
      var a = (d[2] || "").split("-").map(Number);
      return {inv: d[0], dos: d[1], a0: a[0] || 0, a1: a[1] || a[0] || 0, bob: d[3]};
    });
    V = j[0].V || {};
    L = j[0].L.map(function (l) {
      var d = D[l[0]];
      return {d: d, loc: l[1], a0: l[2] || d.a0, a1: l[3] || l[2] || d.a1, eg: l[4], file: l[5],
              film: l[6], bob: l[7], vue: l[8], ark: l[9] || "", f: fold(l[1]) + " | " + fold(l[6]),
              vs: V[l[1] || l[6]] || []};
    });
    // dossier sans aucune ligne d'inventaire : sa tête manque à notre texte de
    // l'inventaire, le village n'est donc pas « absent » (2026-10-14)
    L.forEach(function (l) { if (l.loc) l.d.texte = 1; });
    // la recherche passe aussi par les autres graphies possibles
    L.forEach(function (l) { l.f += " | " + l.vs.map(function (v) { return fold(v[0]); }).join(" | "); });
    var u = {};
    Object.keys(UEZD).forEach(function (k) { u[UEZD[k]] = 1; });
    remplit(fU, T.tousUezd, Object.keys(u).sort().map(function (x) { return [x, x]; }), "");
    remplit(fE, T.toutes, [], "");
    document.documentElement.classList.add("pret");
    q.disabled = bouton.disabled = false;
    q.placeholder = T.placeholder;
    document.getElementById("stats-ligne").textContent = T.stats.replace("{n}", D.length.toLocaleString(T.loc || "en"));
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (h) { q.value = h; cherche(); }
    // un numéro de l'inventaire en bas de page (#inv/dos) : même page, pas de rechargement
    window.addEventListener("hashchange", function () {
      var h = decodeURIComponent((location.hash || "").slice(1));
      if (h && h !== "inventaire") { q.value = h; cherche(); window.scrollTo(0, 0); }
    });
  }).catch(function (e) { console.error(e); document.getElementById("chargement").hidden = false; });

  function remplit(sel, tous, opts, choisi) {
    sel.innerHTML = "";
    var o = el("option", "", tous); o.value = ""; sel.appendChild(o);
    opts.forEach(function (x) {
      o = el("option", "", x[1]); o.value = x[0];
      if (x[0] === choisi) o.selected = true;
      sel.appendChild(o);
    });
  }

  function analyse(s) {
    var c = {cote: null, an: null, mots: []};
    s = s.trim();
    var m = s.match(/(?:211\s*[-\/ ]\s*)?(\d{1,2})\s*[-\/]\s*(\d{1,4}[a-zа]?)/i);
    if (m) { c.cote = [Number(m[1]), m[2].toLowerCase().replace("а", "a")]; s = s.replace(m[0], " "); }
    var y = s.match(/\b(1[789]\d\d)\b/);
    if (y) { c.an = Number(y[1]); s = s.replace(y[0], " "); }
    c.mots = fold(s).split(" ").filter(Boolean);
    return c;
  }

  function cherche(ev) {
    if (ev) ev.preventDefault();
    var c = analyse(q.value);
    res.innerHTML = "";
    if (!c.cote && !c.an && !c.mots.length) {
      res.hidden = plus.hidden = true; compte.textContent = ""; vide.hidden = false; return;
    }
    history.replaceState(null, "", "#" + encodeURIComponent(q.value.trim()));
    var de = Number(fDe.value) || c.an || 0, a = Number(fA.value) || c.an || 0;
    var uz = fU.value, eg = fE.value;
    // village, cote, années, uezd ; les églises se comptent avant leur propre filtre
    var base = L.filter(function (l) {
      if (c.cote && (l.d.inv !== c.cote[0] || l.d.dos !== c.cote[1])) return false;
      if (c.mots.length && !c.mots.every(function (m) { return l.f.indexOf(m) !== -1; })) return false;
      if ((de || a) && l.a0 && ((de && l.a1 < de) || (a && l.a0 > a))) return false;
      if (uz && UEZD[l.d.inv] !== uz) return false;
      return true;
    });
    var n = {};
    base.forEach(function (l) { if (l.eg) n[l.eg] = (n[l.eg] || 0) + 1; });
    if (eg && !n[eg]) eg = "";
    remplit(fE, T.toutes, Object.keys(n).sort(function (x, y) { return n[y] - n[x]; })
      .map(function (k) { return [k, (T.eglises[k] || k) + " (" + n[k] + ")"]; }), eg);
    courant = eg ? base.filter(function (l) { return l.eg === eg; }) : base;
    courant.sort(function (x, y) {
      return (x.a0 || 9999) - (y.a0 || 9999) || x.d.inv - y.d.inv || (parseInt(x.d.dos, 10) - parseInt(y.d.dos, 10));
    });
    vide.hidden = true;
    if (!courant.length) { compte.textContent = T.rien; res.hidden = true; plus.hidden = true; return; }
    compte.textContent = "";
    montre = 0; res.hidden = false; suite();
  }

  function suite() {
    courant.slice(montre, montre + PAS).forEach(function (l) { res.appendChild(ligne(l)); });
    montre = Math.min(montre + PAS, courant.length);
    var reste = courant.length - montre;
    plus.hidden = reste <= 0;
    plus.textContent = T.plus.replace("{n}", Math.min(reste, PAS));
  }
  plus.addEventListener("click", suite);

  // une carte : à gauche ce qui identifie la ligne (cote, nom écrit dans
  // l'inventaire, feuillets), puis ce qui sert au tri ; à droite le bouton
  function ligne(l) {
    var d = l.d, c = el("article", "ligne"), corps = el("div", "ligne-corps");
    var tete = el("div", "ligne-tete");
    tete.appendChild(el("span", "cote", "211-" + d.inv + "/" + d.dos));
    var loc = el("span", "ligne-loc", l.loc || l.film || T.sansTitre);
    if (l.loc && l.film && fold(l.film) !== fold(l.loc)) loc.appendChild(el("span", "film", l.film));
    tete.appendChild(loc);
    if (l.file) tete.appendChild(el("span", "fol", T.feuillets.replace("{f}", l.file)));
    corps.appendChild(tete);

    var info = el("div", "ligne-info");
    var an = l.a0 ? (l.a0 === l.a1 ? String(l.a0) : l.a0 + "–" + l.a1) : "";
    info.appendChild(el("span", "ligne-ani" + (an ? "" : " inconnu"), an || T.anInconnu));
    if (UEZD[d.inv]) info.appendChild(el("span", "badge", UEZD[d.inv]));
    if (l.eg) info.appendChild(el("span", "", T.eglises[l.eg] || l.eg));
    // le n° de bobine ne s'affiche pas : le bouton y mène (Monica, 2026-10-14)
    var bobs = l.bob ? d.bob.filter(function (b) { return b[0] === l.bob; }) : d.bob;
    if (!l.loc && l.film) info.appendChild(el("span", "badge film",
      T.invAbsents.indexOf(l.d.inv) >= 0 ? T.sansInv : l.d.texte ? T.filmSeul : T.sansTexte));
    corps.appendChild(info);

    c.appendChild(corps);

    var acces = el("div", "ligne-acces");
    // un bouton par bobine : l'image du village, sinon la première image du
    // dossier, sinon la liste des dossiers de la bobine ; la vue galerie en
    // secours sous le bouton (Monica, 2026-10-17)
    // le bouton seulement quand le village est repéré ; sinon un lien en
    // texte (début du dossier, ou dossiers de la bobine) et « indiquer le bon
    // lien » (Monica, 2026-10-18)
    bobs.forEach(function (b) {
      var vue = l.vue || b[2], ark = l.vue ? l.ark : b[4], a;
      if (ark) {
        a = lien(image(ark, vue), l.vue ? T.ouvrir : (T.debutLien || T.debut));
      } else if (vue) {
        a = lien(FILM + pad(b[1]) + "?i=" + Math.max(vue - 1, 0), l.vue ? T.ouvrir : (T.debutLien || T.debut));
      } else {
        a = lien(LISTE + pad(b[1]) + "&pageSize=100", T.listeLien || T.liste);
      }
      if (l.vue) {
        a.className = "ouvrir"; acces.appendChild(a);
        if (window.fetch) avis(acces, a, l, vue);
      }
      else {
        var r = el("div", "repli"); a.className = "repli-lien"; r.appendChild(a);
        if (window.CONTRIB && window.fetch) contrib(r, l, vue ? T.indiquer : T.indiquerListe);
        acces.appendChild(r);
      }
    });
    if (bobs.length) c.appendChild(acces);
    return c;
  }

  // proposer un lien : même table Supabase que le site des catagrafii
  // (`propositions`), cote préfixée F211- (2026-10-18)
  var RE_ARK = /^https:\/\/(www\.)?familysearch\.org\/.*ark:\/61903\/3:[12]:[A-Za-z0-9-]+/;
  function contrib(r, l, libelle) {
    var q = el("button", "contrib-q", libelle); q.type = "button";
    r.appendChild(q);
    q.addEventListener("click", function () {
      if (r.querySelector("form")) return;
      var f = el("form", "contrib-form"), msg = el("div", "contrib-msg");
      var champ = el("input", "contrib-lien"); champ.type = "url"; champ.maxLength = 400;
      champ.placeholder = T.contribPh; champ.setAttribute("aria-label", T.contribPh);
      var img = el("input", "contrib-petit"); img.inputMode = "numeric"; img.maxLength = 5;
      img.placeholder = T.contribImage; img.setAttribute("aria-label", T.contribImage);
      var ok = el("button", "", T.envoyer); ok.type = "submit";
      var non = el("button", "contrib-q", T.annuler); non.type = "button";
      non.addEventListener("click", function () { f.remove(); msg.remove(); });
      [champ, img, ok, non].forEach(function (x) { f.appendChild(x); });
      r.appendChild(f); r.appendChild(msg); champ.focus();
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var url = champ.value.trim();
        msg.className = "contrib-msg erreur";
        if (!RE_ARK.test(url)) { msg.textContent = T.invalide; return; }
        ok.disabled = true;
        var corps = { dosar: "F211-" + l.d.inv + "-" + l.d.dos, village: (l.loc || l.film || "*").slice(0, 120),
                      feuillet: (l.file || "").slice(0, 20) || null, langue: T.loc, lien: url };
        var n = parseInt(img.value, 10);
        if (n >= 1 && n <= 20000) corps.image = n;
        fetch(window.CONTRIB.url + "/rest/v1/propositions", {
          method: "POST",
          headers: { apikey: window.CONTRIB.cle, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify(corps)
        }).then(function (rep) {
          if (!rep.ok) throw new Error(rep.status);
          f.remove(); q.remove(); msg.className = "contrib-msg"; msg.textContent = T.merci;
        }).catch(function () { ok.disabled = false; msg.textContent = T.erreur; });
      });
    });
  }

  // le lien ouvre-t-il la bonne image ? 👍/👎 comme sur le site des
  // catagrafii (table `reponses`, compteur GoatCounter) ; 👎 ouvre en plus
  // le formulaire « proposer un lien » (Monica, 2026-10-25)
  function avis(acces, a, l, vue) {
    var cote = "F211-" + l.d.inv + "-" + l.d.dos, cle = "avis211|" + l.d.inv + "-" + l.d.dos + "|v" + vue;
    var b = el("span", "avis"), r = el("div", "repli avis-contrib");
    b.hidden = true; r.hidden = true;
    var deja = null;
    try { deja = localStorage.getItem(cle); } catch (e) {}
    if (deja) b.dataset.vote = "1";
    b.appendChild(el("span", "avis-q", T.avisQ));
    [["ok", "\uD83D\uDC4D", T.avisOui], ["ko", "\uD83D\uDC4E", T.avisNon]].forEach(function (v) {
      var btn = el("button", "avis-btn", v[1]); btn.type = "button";
      btn.title = v[2]; btn.setAttribute("aria-label", v[2]);
      btn.addEventListener("click", function () {
        if (window.goatcounter && window.goatcounter.count)
          window.goatcounter.count({ path: "avis-lien/" + v[0] + "/" + cote + "/v" + vue, title: v[2], event: true });
        if (window.CONTRIB)
          fetch(window.CONTRIB.url + "/rest/v1/reponses", {
            method: "POST",
            headers: { apikey: window.CONTRIB.cle, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ question: cle.replace(/\|/g, "-").slice(0, 40), choix: v[0], langue: T.loc })
          }).catch(function () {});
        try { localStorage.setItem(cle, v[0]); } catch (e) {}
        b.dataset.vote = "1";
        b.textContent = ""; b.appendChild(el("span", "avis-merci", T.avisMerci));
        if (v[0] === "ko" && window.CONTRIB) {
          r.hidden = false; contrib(r, l, T.indiquer);
          r.querySelector(".contrib-q").click();
        }
      });
      b.appendChild(btn);
    });
    a.addEventListener("click", function () { if (b.dataset.vote !== "1") b.hidden = false; });
    acces.appendChild(b); acces.appendChild(r);
  }

  document.getElementById("recherche").addEventListener("submit", cherche);
  [fU, fE, fDe, fA].forEach(function (s) { s.addEventListener("change", cherche); });
})();
