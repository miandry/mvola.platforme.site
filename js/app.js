// =========================================================================
// VARIABLES GLOBALES
// =========================================================================
const APP_CONFIG = {
  maxHistoryEntries: 10,
  localStorageKey: 'codeHistory',
  settingsKey: 'mvolaSettings',
  phoneMaxLength: 10
};

// Éléments DOM
const DOM_ELEMENTS = {
  // Formulaire
  phoneInput: document.getElementById('phone'),
  amountInput: document.getElementById('amount'),
  resultInput: document.getElementById('result'),
  mvolaTypeSelect: document.getElementById('mvolaType'),
  generateBtn: document.getElementById('generateBtn'),
  clearBtn: document.getElementById('clearBtn'),
  callBtn: document.getElementById('callBtn'),
  copyBtn: document.getElementById('copyBtn'),

  // Messages d'erreur
  phoneError: document.getElementById('phoneError'),
  amountError: document.getElementById('amountError'),
  copyMessage: document.getElementById('copyMessage'),

  // Historique
  historyList: document.getElementById('historyList'),
  emptyHistory: document.getElementById('emptyHistory'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  historyContainer: document.getElementById('historyContainer'),
  totalAmount: document.getElementById('totalAmount'),

  // Sidebar mobile
  openSidebarBtn: document.getElementById('openSidebar'),
  closeSidebarBtn: document.getElementById('closeSidebar'),
  overlay: document.getElementById('overlay'),
  sidebar: document.querySelector('aside'),

  // Navigation et Sections
  navGenerator: document.getElementById('navGenerator'),
  navSettings: document.getElementById('navSettings'),
  generatorSection: document.getElementById('generatorSection'),
  settingsSection: document.getElementById('settingsSection'),

  // Paramètres
  ussdEntrepriseInput: document.getElementById('ussdEntreprise'),
  ussdPersonnesInput: document.getElementById('ussdPersonnes'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  settingsMessage: document.getElementById('settingsMessage')
};

// =========================================================================
// CONFIGURATION DYNAMIQUE
// =========================================================================

const CONFIG = {
  ussdEntreprise: '#111*1*3*2*',
  ussdPersonnes: '#111*1*2*'
};

/**
 * Charge les paramètres depuis le localStorage
 */
function loadSettings() {
  const savedSettings = JSON.parse(localStorage.getItem(APP_CONFIG.settingsKey) || "{}");
  if (savedSettings.ussdEntreprise) CONFIG.ussdEntreprise = savedSettings.ussdEntreprise;
  if (savedSettings.ussdPersonnes) CONFIG.ussdPersonnes = savedSettings.ussdPersonnes;

  // Mettre à jour les inputs des paramètres
  if (DOM_ELEMENTS.ussdEntrepriseInput) DOM_ELEMENTS.ussdEntrepriseInput.value = CONFIG.ussdEntreprise;
  if (DOM_ELEMENTS.ussdPersonnesInput) DOM_ELEMENTS.ussdPersonnesInput.value = CONFIG.ussdPersonnes;
}

/**
 * Sauvegarde les paramètres dans le localStorage
 */
function saveSettings() {
  CONFIG.ussdEntreprise = DOM_ELEMENTS.ussdEntrepriseInput.value.trim() || '#111*1*3*2*';
  CONFIG.ussdPersonnes = DOM_ELEMENTS.ussdPersonnesInput.value.trim() || '#111*1*2*';

  localStorage.setItem(APP_CONFIG.settingsKey, JSON.stringify({
    ussdEntreprise: CONFIG.ussdEntreprise,
    ussdPersonnes: CONFIG.ussdPersonnes
  }));

  // Afficher le message de succès
  DOM_ELEMENTS.settingsMessage.classList.remove('hidden');
  setTimeout(() => {
    DOM_ELEMENTS.settingsMessage.classList.add('hidden');
  }, 2000);
}

// =========================================================================
// FONCTIONS UTILITAIRES
// =========================================================================

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number|string} x - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
function formatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Formate un champ de saisie avec des séparateurs de milliers
 * @param {HTMLInputElement} input - L'élément input à formater
 */
function formatNumberOnly(input) {
  // Supprimer tout ce qui n'est pas un chiffre
  let raw = input.value.replace(/\D/g, "");

  // Ajouter des séparateurs de milliers
  let formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Mettre la valeur formatée dans l'input
  input.value = formatted;
}

/**
 * Génère un code Mvola basé sur les paramètres fournis
 * @param {string} mvolaType - Le type de Mvola ('entreprise' ou 'personnes')
 * @param {string} phone - Le numéro de téléphone
 * @param {string} amount - Le montant
 * @returns {string} Le code Mvola généré
 */
function generateMvolaCode(mvolaType, phone, amount) {
  const prefix = mvolaType === "entreprise" ? CONFIG.ussdEntreprise : CONFIG.ussdPersonnes;
  // S'assurer que le préfixe se termine par * s'il n'est pas vide et ne se finit pas par *
  let formattedPrefix = prefix;
  if (formattedPrefix && !formattedPrefix.endsWith('*') && !formattedPrefix.endsWith('#')) {
    formattedPrefix += '*';
  }
  return `${formattedPrefix}${phone}*${amount}*2*1#`;
}

/**
 * Extrait le montant d'un code Mvola
 * @param {string} code - Le code Mvola
 * @returns {number} Le montant extrait
 */
function extractAmountFromCode(code) {
  const match = code.match(/\*(\d+)\*2\*1#$/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Extrait le numéro de téléphone d'un code Mvola
 * @param {string} code - Le code Mvola
 * @returns {string} Le numéro de téléphone extrait
 */
function extractPhoneFromCode(code) {
  const match = code.match(/\*(\d+)\*\d+\*2\*1#$/);
  return match ? match[1] : '';
}

// =========================================================================
// GESTION DE L'HISTORIQUE
// =========================================================================

/**
 * Charge l'historique depuis le localStorage
 * @returns {Array} L'historique des codes
 */
function loadHistory() {
  return JSON.parse(localStorage.getItem(APP_CONFIG.localStorageKey) || "[]");
}

/**
 * Sauvegarde l'historique dans le localStorage
 * @param {Array} history - L'historique à sauvegarder
 */
function saveHistory(history) {
  localStorage.setItem(APP_CONFIG.localStorageKey, JSON.stringify(history));
}

/**
 * Ajoute un code à l'historique
 * @param {string} code - Le code à ajouter
 */
function addToHistory(code) {
  const history = loadHistory();

  // Ajouter la nouvelle entrée avec horodatage
  const newEntry = {
    code: code,
    timestamp: new Date().toISOString(),
  };

  // Ajouter au début du tableau
  history.unshift(newEntry);

  // Limiter le nombre d'entrées
  if (history.length > APP_CONFIG.maxHistoryEntries) {
    history.pop();
  }

  // Sauvegarder dans le localStorage
  saveHistory(history);

  // Mettre à jour l'interface
  updateHistoryUI();
}

/**
 * Met à jour l'affichage de l'historique
 */
function updateHistoryUI() {
  const history = loadHistory();

  // Vider la liste actuelle
  DOM_ELEMENTS.historyList.innerHTML = "";

  let totalAmount = 0;

  // Calculer le montant total à partir de tous les éléments d'historique
  history.forEach((item) => {
    const amount = extractAmountFromCode(item.code);
    totalAmount += amount;
  });

  // Mettre à jour l'affichage du montant total
  DOM_ELEMENTS.totalAmount.textContent = totalAmount.toLocaleString("fr-FR") + " Ar";

  if (history.length === 0) {
    DOM_ELEMENTS.emptyHistory.classList.remove("hidden");
    DOM_ELEMENTS.historyContainer.classList.add("hidden");
  } else {
    DOM_ELEMENTS.emptyHistory.classList.add("hidden");
    DOM_ELEMENTS.historyContainer.classList.remove("hidden");

    // Ajouter chaque élément d'historique
    history.forEach((item, index) => {
      const amount = extractAmountFromCode(item.code);
      const li = createHistoryListItem(item, index, amount);
      DOM_ELEMENTS.historyList.appendChild(li);
    });
  }
}

/**
 * Crée un élément de liste pour l'historique
 * @param {Object} item - L'élément d'historique
 * @param {number} index - L'index de l'élément
 * @param {number} amount - Le montant de la transaction
 * @returns {HTMLLIElement} L'élément de liste créé
 */
function createHistoryListItem(item, index, amount) {
  const li = document.createElement("li");
  li.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  const date = new Date(item.timestamp);
  const formattedDate = date.toLocaleString("fr-FR", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  li.innerHTML = `
    <div class="flex justify-between items-center p-3">
      <div class="flex-1 pr-4">
        <p class="history-code text-sm font-medium text-gray-800 break-all">
          ${item.code}
          ${item.paid ? '<span class="payment-status text-xs font-medium text-green-500 ml-2">Payé</span>' : ""}
        </p>
        <p class="text-sm text-gray-600 mt-1">Montant: ${parseInt(amount).toLocaleString("fr-FR")} Ar</p>
        <p class="text-xs text-gray-500">${formattedDate}</p>
        <p class="history-copy-msg text-xs text-green-500 hidden">Copié!</p>
      </div>
      <div class="flex gap-2">
        <button class="history-call-btn p-2 text-gray-500 hover:text-primary whitespace-nowrap rounded-button">
          <div class="w-5 h-5 flex items-center justify-center">
            <i class="ri-phone-line"></i>
          </div>
        </button>
        <button class="history-copy-btn p-2 text-gray-500 hover:text-primary whitespace-nowrap rounded-button">
          <div class="w-5 h-5 flex items-center justify-center">
            <i class="ri-file-copy-line"></i>
          </div>
        </button>
      </div>
    </div>
  `;

  return li;
}

/**
 * Efface l'historique
 */
function clearHistory() {
  localStorage.removeItem(APP_CONFIG.localStorageKey);
  updateHistoryUI();
}

// =========================================================================
// VALIDATION DES DONNÉES
// =========================================================================

/**
 * Valide le numéro de téléphone
 * @param {string} phone - Le numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
function validatePhone(phone) {
  return phone.length >= 8;
}

/**
 * Valide le montant
 * @param {string} amount - Le montant à valider
 * @returns {boolean} True si le montant est valide
 */
function validateAmount(amount) {
  return amount.replace(/\D/g, "").length > 0;
}

/**
 * Valide le formulaire
 * @returns {boolean} True si le formulaire est valide
 */
function validateForm() {
  const phone = DOM_ELEMENTS.phoneInput.value.trim();
  const amountWithCurrency = DOM_ELEMENTS.amountInput.value.trim();
  const amount = amountWithCurrency.replace(/\D/g, "");

  let isValid = true;

  // Valider le téléphone
  if (!validatePhone(phone)) {
    DOM_ELEMENTS.phoneError.classList.remove("hidden");
    isValid = false;
  } else {
    DOM_ELEMENTS.phoneError.classList.add("hidden");
  }

  // Valider le montant
  if (!validateAmount(amount)) {
    DOM_ELEMENTS.amountError.classList.remove("hidden");
    isValid = false;
  } else {
    DOM_ELEMENTS.amountError.classList.add("hidden");
  }

  return isValid;
}

// =========================================================================
// GESTION DU CLIPBOARD
// =========================================================================

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Le texte à copier
 */
function copyToClipboard(text) {
  // Créer un textarea temporaire pour copier le texte
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// =========================================================================
// GESTION DES DIALOGUES
// =========================================================================

/**
 * Affiche un dialogue d'avertissement pour les doublons
 * @param {boolean} isDuplicate - Si c'est un doublon exact
 * @param {boolean} duplicatePhone - Si le numéro a déjà été utilisé
 * @param {Function} onContinue - Fonction à exécuter si l'utilisateur continue
 */
function showDuplicateWarning(isDuplicate, duplicatePhone, onContinue) {
  const warningDialog = document.createElement("div");
  warningDialog.className = "fixed inset-0 flex items-center justify-center z-50";

  let dialogContent;

  if (duplicatePhone && !isDuplicate) {
    dialogContent = `
      <div class="fixed inset-0 bg-black/50"></div>
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4 relative z-10">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Avertissement</h3>
        <p class="text-gray-600 mb-6">Ce numéro de téléphone a déjà été utilisé. Êtes-vous sûr de vouloir continuer?</p>
        <div class="flex gap-3">
          <button class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-button" id="cancelBtn">Annuler</button>
          <button class="flex-1 bg-primary text-white px-4 py-2 rounded-button" id="continueBtn">Continuer</button>
        </div>
      </div>
    `;
  } else {
    dialogContent = `
      <div class="fixed inset-0 bg-black/50"></div>
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4 relative z-10">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Avertissement</h3>
        <p class="text-gray-600 mb-6">Cette combinaison de numéro de téléphone et de montant a déjà été utilisée.</p>
        <div class="flex gap-3">
          <button class="w-full bg-primary text-white px-4 py-2 rounded-button" id="okBtn">OK</button>
        </div>
      </div>
    `;
  }

  warningDialog.innerHTML = dialogContent;
  document.body.appendChild(warningDialog);

  // Gérer les boutons du dialogue
  if (duplicatePhone && !isDuplicate) {
    document.getElementById('cancelBtn').addEventListener('click', () => {
      warningDialog.remove();
    });

    document.getElementById('continueBtn').addEventListener('click', () => {
      onContinue();
      warningDialog.remove();
    });
  } else {
    document.getElementById('okBtn').addEventListener('click', () => {
      warningDialog.remove();
    });
  }
}

// =========================================================================
// GESTION DE LA SIDEBAR MOBILE
// =========================================================================

/**
 * Ouvre la sidebar mobile
 */
function openSidebar() {
  DOM_ELEMENTS.sidebar.classList.remove("-translate-x-full");
  DOM_ELEMENTS.overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/**
 * Ferme la sidebar mobile
 */
function closeSidebar() {
  DOM_ELEMENTS.sidebar.classList.add("-translate-x-full");
  DOM_ELEMENTS.overlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// =========================================================================
// GESTION DU ZOOM ET DU DÉFILEMENT
// =========================================================================

/**
 * Empêche le zoom et le défilement non désirés
 */
function preventZoomAndScroll() {
  // Bloquer ctrl/cmd + plus/minus/0 et roulette avec ctrl
  window.addEventListener('keydown', function(e) {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl) {
      if (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, { passive: false });

  // Bloquer la roulette quand ctrl/cmd est pressé
  window.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { passive: false });

  // Empêcher le pinch-zoom sur mobile
  window.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  }, { passive: false });

  // Empêcher le double tap zoom
  (function() {
    let lastTouch = 0;
    window.addEventListener('touchend', function(e) {
      const now = Date.now();
      if (now - lastTouch <= 300) {
        e.preventDefault();
      }
      lastTouch = now;
    }, { passive: false });
  })();

  // Empêcher pinch (deux doigts)
  window.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Empêcher scroll horizontal par clavier
  window.addEventListener('keydown', function(e) {
    const blockedKeys = ['ArrowLeft', 'ArrowRight'];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { passive: false });

  // S'assurer que body ne dépasse pas largeur viewport
  function clampBodyWidth() {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
  }

  clampBodyWidth();
  window.addEventListener('resize', clampBodyWidth);
}

// =========================================================================
// NAVIGATION
// =========================================================================

function showSection(sectionId) {
  if (sectionId === 'generator') {
    DOM_ELEMENTS.generatorSection.classList.remove('hidden');
    DOM_ELEMENTS.settingsSection.classList.add('hidden');

    DOM_ELEMENTS.navGenerator.classList.add('bg-primary/10', 'text-primary');
    DOM_ELEMENTS.navGenerator.classList.remove('text-gray-600', 'hover:bg-gray-100');

    DOM_ELEMENTS.navSettings.classList.remove('bg-primary/10', 'text-primary');
    DOM_ELEMENTS.navSettings.classList.add('text-gray-600', 'hover:bg-gray-100');
  } else {
    DOM_ELEMENTS.generatorSection.classList.add('hidden');
    DOM_ELEMENTS.settingsSection.classList.remove('hidden');

    DOM_ELEMENTS.navSettings.classList.add('bg-primary/10', 'text-primary');
    DOM_ELEMENTS.navSettings.classList.remove('text-gray-600', 'hover:bg-gray-100');

    DOM_ELEMENTS.navGenerator.classList.remove('bg-primary/10', 'text-primary');
    DOM_ELEMENTS.navGenerator.classList.add('text-gray-600', 'hover:bg-gray-100');
  }
}

// =========================================================================
// INITIALISATION DE L'APPLICATION
// =========================================================================

/**
 * Initialise l'application
 */
function initApp() {
  // Charger les paramètres
  loadSettings();

  // Initialiser la navigation
  DOM_ELEMENTS.navGenerator.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('generator');
  });

  DOM_ELEMENTS.navSettings.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('settings');
  });

  const navHistory = document.getElementById('navHistory');
  if (navHistory) {
    navHistory.addEventListener('click', (e) => {
      showSection('generator');
    });
  }

  // Initialiser la sauvegarde des paramètres
  DOM_ELEMENTS.saveSettingsBtn.addEventListener('click', saveSettings);

  // Initialiser la validation du téléphone
  initPhoneValidation();

  // Initialiser le formatage du montant
  initAmountFormatting();

  // Initialiser la génération de code
  initCodeGeneration();

  // Initialiser la gestion du clipboard
  initClipboard();

  // Initialiser la sidebar mobile
  initMobileSidebar();

  // Initialiser la gestion du zoom et défilement
  preventZoomAndScroll();

  // Charger l'historique
  updateHistoryUI();

  // Enregistrer le Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker enregistré', reg))
      .catch(err => console.error('Erreur Service Worker', err));
  }
}

/**
 * Initialise la validation du téléphone
 */
function initPhoneValidation() {
  DOM_ELEMENTS.phoneInput.addEventListener("input", function (e) {
    // Supprimer les caractères non numériques
    let value = e.target.value.replace(/\D/g, "");

    // Limiter à 10 chiffres
    if (value.length > APP_CONFIG.phoneMaxLength) {
      value = value.substring(0, APP_CONFIG.phoneMaxLength);
    }

    e.target.value = value;

    // Valider le numéro de téléphone
    if (value.length < 8) {
      DOM_ELEMENTS.phoneError.classList.remove("hidden");
    } else {
      DOM_ELEMENTS.phoneError.classList.add("hidden");
    }
  });
}

/**
 * Initialise le formatage du montant
 */
function initAmountFormatting() {
  DOM_ELEMENTS.amountInput.addEventListener("input", function (e) {
    formatNumberOnly(e.target);

    // Valider le montant
    let value = e.target.value.replace(/\D/g, "");
    if (!value) {
      DOM_ELEMENTS.amountError.classList.remove("hidden");
    } else {
      DOM_ELEMENTS.amountError.classList.add("hidden");
    }
  });
}

/**
 * Initialise la génération de code
 */
function initCodeGeneration() {
  DOM_ELEMENTS.generateBtn.addEventListener("click", function () {
    // Récupérer les valeurs
    const phone = DOM_ELEMENTS.phoneInput.value.trim();
    const amountWithCurrency = DOM_ELEMENTS.amountInput.value.trim();
    const mvolaType = DOM_ELEMENTS.mvolaTypeSelect.value;

    // Extraire le montant numérique
    const amount = amountWithCurrency.replace(/\D/g, "");

    // Valider les entrées
    if (!validateForm()) {
      return;
    }

    // Générer le code basé sur le type Mvola
    const generatedCode = generateMvolaCode(mvolaType, phone, amount);

    // Vérifier les doublons dans l'historique
    const history = loadHistory();
    const isDuplicate = history.some((item) => {
      return item.code === generatedCode;
    });

    const duplicatePhone = history.some((item) => {
      const itemPhone = extractPhoneFromCode(item.code);
      return itemPhone === phone;
    });

    if (isDuplicate || duplicatePhone) {
      showDuplicateWarning(isDuplicate, duplicatePhone, () => {
        DOM_ELEMENTS.resultInput.value = generatedCode;
        addToHistory(generatedCode);
        DOM_ELEMENTS.copyBtn.classList.remove("hidden");
      });
    } else {
      DOM_ELEMENTS.resultInput.value = generatedCode;
      addToHistory(generatedCode);
      DOM_ELEMENTS.copyBtn.classList.remove("hidden");
    }
  });

  // Bouton d'appel
  DOM_ELEMENTS.callBtn.addEventListener("click", function () {
    const phone = DOM_ELEMENTS.phoneInput.value.trim();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  });

  // Boutons de suppression
  const clearPhoneBtn = document.createElement("button");
  clearPhoneBtn.type = "button";
  clearPhoneBtn.className = "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600";
  clearPhoneBtn.innerHTML = '<div class="w-5 h-5 flex items-center justify-center"><i class="ri-close-line"></i></div>';
  DOM_ELEMENTS.phoneInput.parentElement.appendChild(clearPhoneBtn);

  const clearAmountBtn = document.createElement("button");
  clearAmountBtn.type = "button";
  clearAmountBtn.className = "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600";
  clearAmountBtn.innerHTML = '<div class="w-5 h-5 flex items-center justify-center"><i class="ri-close-line"></i></div>';
  DOM_ELEMENTS.amountInput.parentElement.appendChild(clearAmountBtn);

  clearPhoneBtn.addEventListener("click", function () {
    DOM_ELEMENTS.phoneInput.value = "";
    DOM_ELEMENTS.phoneError.classList.add("hidden");
    DOM_ELEMENTS.resultInput.value = "";
    DOM_ELEMENTS.copyMessage.classList.add("hidden");
  });

  clearAmountBtn.addEventListener("click", function () {
    DOM_ELEMENTS.amountInput.value = "";
    DOM_ELEMENTS.amountError.classList.add("hidden");
    DOM_ELEMENTS.resultInput.value = "";
    DOM_ELEMENTS.copyMessage.classList.add("hidden");
  });

  DOM_ELEMENTS.clearBtn.addEventListener("click", function () {
    DOM_ELEMENTS.phoneInput.value = "";
    DOM_ELEMENTS.amountInput.value = "";
    DOM_ELEMENTS.resultInput.value = "";
    DOM_ELEMENTS.phoneError.classList.add("hidden");
    DOM_ELEMENTS.amountError.classList.add("hidden");
    DOM_ELEMENTS.copyMessage.classList.add("hidden");
  });
}

/**
 * Initialise la gestion du clipboard
 */
function initClipboard() {
  // Copie du code principal
  DOM_ELEMENTS.copyBtn.addEventListener("click", function () {
    if (DOM_ELEMENTS.resultInput.value) {
      copyToClipboard(DOM_ELEMENTS.resultInput.value);

      // Afficher le message de copie
      DOM_ELEMENTS.copyMessage.classList.remove("hidden");

      // Masquer le message après 2 secondes
      setTimeout(() => {
        DOM_ELEMENTS.copyMessage.classList.add("hidden");
      }, 2000);
    }
  });

  // Gestion des boutons de copie et d'appel de l'historique
  document.addEventListener("click", function (e) {
    if (e.target.closest(".history-copy-btn")) {
      const codeElement = e.target.closest("li").querySelector(".history-code");
      const code = codeElement.textContent;

      copyToClipboard(code);

      // Afficher le message de copie temporaire
      const copyMsg = e.target.closest("li").querySelector(".history-copy-msg");
      copyMsg.classList.remove("hidden");
      setTimeout(() => {
        copyMsg.classList.add("hidden");
      }, 2000);
    }

    if (e.target.closest(".history-call-btn")) {
      const codeElement = e.target.closest("li").querySelector(".history-code");
      const code = codeElement.textContent;
      const historyItem = e.target.closest("li");
      const statusElement = historyItem.querySelector(".payment-status");

      if (!statusElement) {
        const status = document.createElement("span");
        status.className = "payment-status text-xs font-medium text-green-500 ml-2";
        status.textContent = "Payé";
        historyItem.querySelector(".history-code").appendChild(status);

        const history = loadHistory();
        const itemIndex = Array.from(DOM_ELEMENTS.historyList.children).indexOf(historyItem);
        if (history[itemIndex]) {
          history[itemIndex].paid = true;
          saveHistory(history);
        }
      }

      window.location.href = `tel:${code}`;
    }
  });
}

/**
 * Initialise la sidebar mobile
 */
function initMobileSidebar() {
  DOM_ELEMENTS.openSidebarBtn.addEventListener("click", openSidebar);
  if (DOM_ELEMENTS.closeSidebarBtn) {
    DOM_ELEMENTS.closeSidebarBtn.addEventListener("click", closeSidebar);
  }
  DOM_ELEMENTS.overlay.addEventListener("click", closeSidebar);

  // Fermer la sidebar en cliquant sur un lien (mobile uniquement)
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    });
  });

  // Gérer le redimensionnement de la fenêtre
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
}

/**
 * Initialise la gestion de l'historique
 */
function initHistoryManagement() {
  DOM_ELEMENTS.clearHistoryBtn.addEventListener("click", clearHistory);
}

// =========================================================================
// EXÉCUTION AU CHARGEMENT DE LA PAGE
// =========================================================================
document.addEventListener("DOMContentLoaded", function () {
  initApp();
  initHistoryManagement();
});
