/**
 * Patterns USSD partagés — stockés dans localStorage
 * Placeholders: {phone}, {amount}
 */
window.MvolaPatterns = (function () {
  const STORAGE_KEY = "ussdPatterns";

  const DEFAULTS = {
    transfert_entreprise: "#111*1*3*2*{phone}*{amount}*2*1#",
    transfert_personnes: "#111*1*2*{phone}*{amount}*2*1#",
    depot: "#111*1*4*3*{phone}*{amount}*2*1#",
    retrait_agent: "#111*1*4*1*{amount}*2*1#",
    retrait_dab: "#111*1*4*2*{amount}*2*1#",
    epargne_depot: "#111*1*3*1*1*{amount}*2*1#",
    epargne_retrait: "#111*1*3*1*2*{amount}*2*1#",
    solde_mvola: "#111*1*1#",
    solde_epargne: "#111*1*3*1*3#",
    transactions_mvola: "#111*1*5#",
    transactions_epargne: "#111*1*3*1*5#"
  };

  const META = [
    {
      group: "Transfert",
      icon: "ri-exchange-line",
      items: [
        { key: "transfert_entreprise", label: "Entreprise", hint: "Utilise {phone} et {amount}" },
        { key: "transfert_personnes", label: "Personnes", hint: "Utilise {phone} et {amount}" }
      ]
    },
    {
      group: "Dépôt",
      icon: "ri-add-circle-line",
      items: [
        { key: "depot", label: "Dépôt client", hint: "Utilise {phone} et {amount}" }
      ]
    },
    {
      group: "Retrait",
      icon: "ri-hand-coin-line",
      items: [
        { key: "retrait_agent", label: "Agent / PoP", hint: "Utilise {amount}" },
        { key: "retrait_dab", label: "DAB", hint: "Utilise {amount}" }
      ]
    },
    {
      group: "Épargne",
      icon: "ri-safe-2-line",
      items: [
        { key: "epargne_depot", label: "Dépôt épargne", hint: "Utilise {amount}" },
        { key: "epargne_retrait", label: "Retrait épargne", hint: "Utilise {amount}" }
      ]
    },
    {
      group: "Solde",
      icon: "ri-wallet-3-line",
      items: [
        { key: "solde_mvola", label: "Compte Mvola", hint: "Code fixe" },
        { key: "solde_epargne", label: "Compte Épargne", hint: "Code fixe" }
      ]
    },
    {
      group: "Transactions",
      icon: "ri-file-list-3-line",
      items: [
        { key: "transactions_mvola", label: "Compte Mvola", hint: "Code fixe" },
        { key: "transactions_epargne", label: "Compte Épargne", hint: "Code fixe" }
      ]
    }
  ];

  function getPatterns() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.assign({}, DEFAULTS, saved);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function savePatterns(patterns) {
    const toSave = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      const value = (patterns[key] || "").trim();
      toSave[key] = value || DEFAULTS[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return toSave;
  }

  function resetPatterns() {
    localStorage.removeItem(STORAGE_KEY);
    return Object.assign({}, DEFAULTS);
  }

  function apply(key, vars) {
    vars = vars || {};
    const patterns = getPatterns();
    var code = patterns[key] != null ? patterns[key] : DEFAULTS[key];
    if (!code) return "";
    return String(code)
      .replace(/\{phone\}/g, vars.phone != null ? vars.phone : "")
      .replace(/\{amount\}/g, vars.amount != null ? vars.amount : "");
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULTS: DEFAULTS,
    META: META,
    getPatterns: getPatterns,
    savePatterns: savePatterns,
    resetPatterns: resetPatterns,
    apply: apply
  };
})();
