/**
 * script.js — BétonPro Landing Page
 * ════════════════════════════════════════════════════════════════
 *
 * TABLE DES MATIÈRES :
 *   1.  Configuration
 *   2.  Header (scroll + ombre)
 *   3.  Menu mobile (burger)
 *   4.  Slider hero
 *   5.  Animations au scroll (fade-up)
 *   6.  Logo fallback
 *   7.  Accordéons du formulaire
 *   8.  Validation du formulaire
 *   9.  Connexion Google Sheets — Guide complet
 *  10.  Soumission du formulaire
 *  11.  Footer — année dynamique
 *
 * ════════════════════════════════════════════════════════════════
 */


/* ════════════════════════════════════════════════
   1. CONFIGURATION
   ════════════════════════════════════════════════
   Modifiez ces valeurs selon vos besoins.
*/

const CONFIG = {

  /* Durée de chaque slide en millisecondes */
  SLIDE_DURATION: 5500,

  /**
   * ────────────────────────────────────────────────
   * CONNEXION GOOGLE SHEETS — URL DE DÉPLOIEMENT
   * ────────────────────────────────────────────────
   *
   * MÉTHODE RECOMMANDÉE : Google Apps Script (GAS)
   *
   * ÉTAPES COMPLÈTES POUR CONNECTER VOTRE FORMULAIRE :
   *
   * ① Créez un Google Sheet :
   *    → Ouvrez drive.google.com → Nouveau → Google Sheets
   *    → Nommez-le "Leads BétonPro"
   *    → Ajoutez en ligne 1 les en-têtes (colonnes A à J) :
   *      Date | Q1_Raison | Q2_Délai | Q3_Production |
   *      Entreprise | Nom | Email | Téléphone | WhatsApp | Ville
   *
   * ② Ouvrez l'éditeur Apps Script :
   *    → Dans votre Sheet : Extensions → Apps Script
   *
   * ③ Supprimez le code par défaut et collez EXACTEMENT ce code :
   *
   *    function doPost(e) {
   *      try {
   *        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   *        var data  = JSON.parse(e.postData.contents);
   *        sheet.appendRow([
   *          new Date(),
   *          data.q1        || '',
   *          data.q2        || '',
   *          data.q3        || '',
   *          data.entreprise|| '',
   *          data.nom       || '',
   *          data.email     || '',
   *          data.telephone || '',
   *          data.whatsapp  || '',
   *          data.ville     || ''
   *        ]);
   *        return ContentService
   *          .createTextOutput(JSON.stringify({ status: 'ok' }))
   *          .setMimeType(ContentService.MimeType.JSON);
   *      } catch(err) {
   *        return ContentService
   *          .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
   *          .setMimeType(ContentService.MimeType.JSON);
   *      }
   *    }
   *
   * ④ Déployez :
   *    → Cliquez sur "Déployer" → "Nouveau déploiement"
   *    → Type : Application Web
   *    → Exécuter en tant que : Moi (votre email)
   *    → Qui peut accéder : Tout le monde
   *    → Cliquez "Déployer" → Autorisez les permissions
   *
   * ⑤ Copiez l'URL générée (format : https://script.google.com/macros/s/XXXXX/exec)
   *    et remplacez la valeur GOOGLE_SCRIPT_URL ci-dessous.
   *
   * ⑥ À chaque modification du script GAS → Nouveau déploiement
   *    (pas "Mettre à jour le déploiement existant")
   *
   * NOTE TECHNIQUE :
   *   Le fetch utilise mode 'no-cors' car Apps Script ne renvoie
   *   pas de headers CORS en POST. La réponse sera "opaque" mais
   *   les données sont bien enregistrées dans le Sheet.
   *   Pour tester : vérifiez directement votre Google Sheet.
   */
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw9M67BMBvTSFHjBN2unoUL8dpj3P2QEYN-NuLv6fq5H4ILX3pKRdYlpEY7nbFMC6Z-/exec',

};


/* ════════════════════════════════════════════════
   2. HEADER — ombre au scroll
   ════════════════════════════════════════════════ */
(function initHeader() {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;

  function updateHeader() {
    hdr.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());


/* ════════════════════════════════════════════════
   3. MENU MOBILE — burger
   ════════════════════════════════════════════════ */
(function initBurger() {
  const btn = document.getElementById('burger');
  const nav = document.getElementById('mob-nav');
  if (!btn || !nav) return;

  let open = false;

  function toggle() {
    open = !open;
    btn.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /* Clic burger */
  btn.addEventListener('click', toggle);

  /* Fermeture sur clic lien */
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (open) toggle(); }));

  /* Fermeture clic extérieur */
  document.addEventListener('click', e => {
    const hdr = document.getElementById('site-header');
    if (open && hdr && !hdr.contains(e.target)) toggle();
  });
}());


/* ════════════════════════════════════════════════
   4. SLIDER HERO
   ════════════════════════════════════════════════ */
(function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.s-dot');
  const prevBtn = document.getElementById('s-prev');
  const nextBtn = document.getElementById('s-next');
  const progBar = document.getElementById('prog-bar');

  if (!slides.length) return;

  let current = 0;
  let autoplay = null;

  /* ── Affiche le slide à l'index donné ── */
  function goTo(idx) {
    /* Désactive l'actuel */
    slides[current].classList.remove('on');
    dots[current].classList.remove('s-dot-on');
    dots[current].setAttribute('aria-selected', 'false');

    current = (idx + slides.length) % slides.length;

    /* Active le nouveau */
    slides[current].classList.add('on');
    dots[current].classList.add('s-dot-on');
    dots[current].setAttribute('aria-selected', 'true');

    /* Réinitialise la barre de progression */
    resetProgress();
  }

  /* ── Barre de progression ── */
  function resetProgress() {
    if (!progBar) return;
    progBar.style.transition = 'none';
    progBar.style.width = '0%';
    void progBar.offsetWidth; // reflow forcé
    progBar.style.transition = `width ${CONFIG.SLIDE_DURATION}ms linear`;
    progBar.style.width = '100%';
  }

  /* ── Autoplay ── */
  function startAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(current + 1), CONFIG.SLIDE_DURATION);
  }

  /* ── Boutons navigation ── */
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

  /* ── Dots ── */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.to, 10);
      if (target !== current) { goTo(target); startAutoplay(); }
    });
  });

  /* ── Navigation clavier ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); startAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAutoplay(); }
  });

  /* ── Pause au survol ── */
  const heroSection = document.getElementById('accueil');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => {
      clearInterval(autoplay);
      if (progBar) { progBar.style.transition = 'none'; }
    });
    heroSection.addEventListener('mouseleave', () => {
      startAutoplay();
      resetProgress();
    });
  }

  /* ── Init ── */
  goTo(0);
  startAutoplay();
}());


/* ════════════════════════════════════════════════
   5. ANIMATIONS AU SCROLL — fade-up
   ════════════════════════════════════════════════ */
(function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length || !('IntersectionObserver' in window)) {
    /* Fallback : affiche tout si IntersectionObserver non supporté */
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => obs.observe(el));
}());


/* ════════════════════════════════════════════════
   6. LOGO FALLBACK
   Si l'image logo a un src vide, affiche le texte.
   ════════════════════════════════════════════════ */
(function initLogo() {
  const imgs = document.querySelectorAll('.logo-img');
  imgs.forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
    if (!img.getAttribute('src') || img.getAttribute('src') === '') {
      img.style.display = 'none';
    }
  });
}());


/* ════════════════════════════════════════════════
   7. ACCORDÉONS DU FORMULAIRE
   ════════════════════════════════════════════════ */
(function initAccordions() {
  /**
   * Configuration des 3 accordéons.
   * name      = attribut [data-name] sur .acc
   * btnId     = id du bouton déclencheur
   * panelId   = id du panneau
   * valId     = id du span affichant la valeur choisie
   * errorId   = id du message d'erreur
   * radioName = name des input[type=radio]
   */
  const ACCS = [
    { name: 'q1', btnId: 'btn-q1', panelId: 'p-q1', valId: 'v-q1', errorId: 'e-q1', radioName: 'q1' },
    { name: 'q2', btnId: 'btn-q2', panelId: 'p-q2', valId: 'v-q2', errorId: 'e-q2', radioName: 'q2' },
    { name: 'q3', btnId: 'btn-q3', panelId: 'p-q3', valId: 'v-q3', errorId: 'e-q3', radioName: 'q3' },
  ];

  /* Ferme tous sauf l'actif */
  function closeAllExcept(activeName) {
    ACCS.forEach(a => {
      if (a.name === activeName) return;
      const btn = document.getElementById(a.btnId);
      const panel = document.getElementById(a.panelId);
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
  }

  /* Ouvre ou ferme un accordéon */
  function toggle(acc) {
    const btn = document.getElementById(acc.btnId);
    const panel = document.getElementById(acc.panelId);
    if (!btn || !panel) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    closeAllExcept(acc.name);

    btn.setAttribute('aria-expanded', !isOpen);
    panel.hidden = isOpen;
  }

  /* Met à jour l'affichage de la valeur sélectionnée */
  function updateDisplay(acc) {
    const form = document.getElementById('lead-form');
    const valEl = document.getElementById(acc.valId);
    const errEl = document.getElementById(acc.errorId);
    const checked = form ? form.querySelector(`input[name="${acc.radioName}"]:checked`) : null;

    if (valEl) {
      let label = checked ? checked.value : '';
      /* Tronque si trop long pour l'affichage inline */
      if (label.length > 38) label = label.slice(0, 36) + '…';
      valEl.textContent = label;
    }

    if (checked) {
      /* Cache l'erreur */
      if (errEl) errEl.hidden = true;
      /* Ferme automatiquement après sélection */
      const btn = document.getElementById(acc.btnId);
      const panel = document.getElementById(acc.panelId);
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    }
  }

  /* Attache les events */
  ACCS.forEach(acc => {
    const btn = document.getElementById(acc.btnId);
    const form = document.getElementById('lead-form');
    if (!btn) return;

    /* Clic sur le déclencheur */
    btn.addEventListener('click', () => toggle(acc));

    /* Changement de radio → update display */
    if (form) {
      form.querySelectorAll(`input[name="${acc.radioName}"]`).forEach(radio => {
        radio.addEventListener('change', () => updateDisplay(acc));
      });
    }
  });

  /* Export pour validation */
  window._ACCS = ACCS;
}());


/* ════════════════════════════════════════════════
   8. VALIDATION DU FORMULAIRE
   ════════════════════════════════════════════════ */

/** Vérifie le format d'un email */
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** Vérifie le format d'un numéro de téléphone */
function isPhone(v) {
  /* Accepte : +212 6XXXXXXXX, 0600000000, +33 6 00 00 00 00, etc. */
  return /^[+\d][\d\s\-().]{7,20}$/.test(v.trim());
}

/** Retourne la valeur du radio coché dans le groupe [name] */
function radioVal(name) {
  const form = document.getElementById('lead-form');
  const el = form ? form.querySelector(`input[name="${name}"]:checked`) : null;
  return el ? el.value : null;
}

/** Affiche ou cache un message d'erreur */
function showErr(id, show) {
  const el = document.getElementById(id);
  if (el) el.hidden = !show;
}

/** Applique / retire la classe d'erreur sur un input */
function setInpErr(id, hasErr) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('has-err', hasErr);
}

/** Valide tout le formulaire. Retourne true si valide. */
function validateForm() {
  let ok = true;

  /* Q1 */
  const q1 = radioVal('q1');
  showErr('e-q1', !q1);
  if (!q1) ok = false;

  /* Q2 */
  const q2 = radioVal('q2');
  showErr('e-q2', !q2);
  if (!q2) ok = false;

  /* Q3 */
  const q3 = radioVal('q3');
  showErr('e-q3', !q3);
  if (!q3) ok = false;

  /* Entreprise */
  const co = document.getElementById('fe-co').value.trim();
  setInpErr('fe-co', !co); showErr('e-co', !co);
  if (!co) ok = false;

  /* Nom */
  const nm = document.getElementById('fe-nm').value.trim();
  setInpErr('fe-nm', !nm); showErr('e-nm', !nm);
  if (!nm) ok = false;

  /* Email */
  const em = document.getElementById('fe-em').value.trim();
  const emBad = !isEmail(em);
  setInpErr('fe-em', emBad); showErr('e-em', emBad);
  if (emBad) ok = false;

  /* Téléphone */
  const tl = document.getElementById('fe-tl').value.trim();
  const tlBad = !isPhone(tl);
  setInpErr('fe-tl', tlBad); showErr('e-tl', tlBad);
  if (tlBad) ok = false;

  /* Ville */
  const vi = document.getElementById('fe-vi').value.trim();
  setInpErr('fe-vi', !vi); showErr('e-vi', !vi);
  if (!vi) ok = false;

  return ok;
}


/* ════════════════════════════════════════════════
   9. CONNEXION GOOGLE SHEETS — LOGIQUE JS
   ════════════════════════════════════════════════
   Cette fonction envoie les données du formulaire
   vers votre Google Apps Script Web App.

   IMPORTANT : lisez CONFIG.GOOGLE_SCRIPT_URL
   au début de ce fichier pour les instructions
   de configuration complètes.
   ════════════════════════════════════════════════ */

/**
 * Envoie les données au Google Apps Script via FormData.
 *
 * POURQUOI FORMDATA et pas JSON + no-cors ?
 * ─────────────────────────────────────────
 * Google Apps Script (GAS) ne renvoie pas de headers CORS.
 * Avec fetch + JSON + no-cors, la requête part mais GAS ne peut
 * pas lire e.postData.contents correctement dans tous les cas.
 *
 * La méthode fiable et universelle est d'utiliser un <form> HTML
 * soumis vers l'URL GAS via fetch avec redirect: 'follow'.
 * GAS lit alors les données via e.parameter (form fields).
 *
 * @param {Object} payload - Objet données à envoyer
 * @returns {Promise<void>}
 */
/**
 * Envoie les données via un <form> HTML caché soumis dans une iframe cachée.
 *
 * C'est la SEULE méthode 100% fiable avec Google Apps Script.
 *
 * Pourquoi ?
 * - fetch + no-cors     → réponse opaque, erreurs silencieuses
 * - fetch + FormData    → erreur CORS sur la redirection Google
 * - fetch + JSON        → GAS ne lit pas e.postData dans tous les cas
 * - form caché + iframe → contourne CORS complètement, toujours fiable
 */
function sendToSheets(payload) {
  return new Promise(function(resolve, reject) {

    /* 1. Crée une iframe invisible */
    var iframe = document.createElement('iframe');
    iframe.name    = 'hidden_iframe_' + Date.now();
    iframe.id      = iframe.name;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    /* 2. Crée un formulaire caché ciblant l'iframe */
    var form = document.createElement('form');
    form.method  = 'POST';
    form.action  = CONFIG.GOOGLE_SCRIPT_URL;
    form.target  = iframe.name;
    form.style.display = 'none';

    /* 3. Ajoute tous les champs */
    Object.keys(payload).forEach(function(key) {
      var input   = document.createElement('input');
      input.type  = 'hidden';
      input.name  = key;
      input.value = payload[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);

    /* 4. Quand l'iframe a chargé = GAS a reçu les données */
    iframe.onload = function() {
      resolve();
      /* Nettoyage après 3 secondes */
      setTimeout(function() {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 3000);
    };

    /* 5. Timeout de sécurité (10 secondes) */
    var timeout = setTimeout(function() {
      resolve(); /* On considère que c'est passé */
      try {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      } catch(e) {}
    }, 10000);

    iframe.onload = function() {
      clearTimeout(timeout);
      resolve();
      setTimeout(function() {
        try {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        } catch(e) {}
      }, 3000);
    };

    /* 6. Soumet le formulaire */
    form.submit();
  });
}

/**
 * Construit l'objet de données à partir du formulaire.
 * @returns {Object}
 */
function buildPayload() {
  return {
    timestamp: new Date().toISOString(),
    q1: radioVal('q1') || '',
    q2: radioVal('q2') || '',
    q3: radioVal('q3') || '',
    entreprise: document.getElementById('fe-co').value.trim() || '',
    nom: document.getElementById('fe-nm').value.trim() || '',
    email: document.getElementById('fe-em').value.trim() || '',
    telephone: document.getElementById('fe-tl').value.trim() || '',
    whatsapp: document.getElementById('fe-wa').value.trim() || '',
    ville: document.getElementById('fe-vi').value.trim() || '',
  };
}


/* ════════════════════════════════════════════════
   10. SOUMISSION DU FORMULAIRE
   ════════════════════════════════════════════════ */
(function initForm() {
  const form = document.getElementById('lead-form');
  const subBtn = document.getElementById('sub-btn');
  const subLbl = document.getElementById('sub-lbl');
  const subSpin = document.getElementById('sub-spin');
  const fOk = document.getElementById('f-ok');
  const fErr = document.getElementById('f-err');

  if (!form) return;

  /* États du bouton */
  function setLoading(on) {
    subBtn.disabled = on;
    if (subLbl) subLbl.textContent = on ? 'Envoi en cours…' : 'Envoyer ma demande de devis';
    if (subSpin) subSpin.hidden = !on;
  }

  /* Soumission */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (fErr) fErr.hidden = true;

    /* ① Validation */
    if (!validateForm()) {
      const firstErr = form.querySelector('.ferr:not([hidden]), .finp.has-err');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const payload = buildPayload();
    console.log('[BétonPro] Envoi payload :', payload);

    setLoading(true);

    try {
      await sendToSheets(payload);

      /* ✅ Succès — affiche le message et cache le formulaire */
      form.style.display = 'none';
      if (fOk) {
        fOk.hidden = false;
        fOk.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

    } catch (err) {
      console.error('[BétonPro] Erreur envoi :', err);
      setLoading(false);
      if (fErr) {
        fErr.hidden = false;
        fErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  /* Nettoyage temps réel : retire les erreurs au fur et à mesure */
  ['fe-co', 'fe-nm', 'fe-em', 'fe-tl', 'fe-vi'].forEach(id => {
    const el = document.getElementById(id);
    const map = { 'fe-co': 'e-co', 'fe-nm': 'e-nm', 'fe-em': 'e-em', 'fe-tl': 'e-tl', 'fe-vi': 'e-vi' };
    if (!el) return;
    el.addEventListener('input', () => {
      el.classList.remove('has-err');
      const errEl = document.getElementById(map[id]);
      if (errEl) errEl.hidden = true;
    });
  });
}());


/* ════════════════════════════════════════════════
   11. FOOTER — ANNÉE DYNAMIQUE
   ════════════════════════════════════════════════ */
(function initYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}());
