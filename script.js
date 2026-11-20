/* =========================================================
   CHEZ WIEME — Prototype e-commerce 100 % local
   ---------------------------------------------------------
   IMPORTANT — Ce fichier est une DÉMONSTRATION.
   - Les comptes, la vérification e-mail et les commandes sont
     simulés et stockés dans le navigateur (localStorage).
   - Les mots de passe ne sont jamais stockés en clair : seul un
     empreinte SHA-256 de démonstration est conservée. Ce n'est
     PAS une authentification sécurisée.
   - Aucun paiement réel n'est effectué et aucune donnée bancaire
     n'est demandée.
   - Pour une vraie boutique : backend, base de données, mots de
     passe hachés côté serveur, sessions sécurisées, vérification
     e-mail réelle et prestataire de paiement certifié.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. RÉGLAGES — À PERSONNALISER
   --------------------------------------------------------- */

/* WhatsApp : indicatif + numéro, sans +, sans espace.
   Exemple : "21612345678". Laissez vide en attendant. */
const CONTACT = {
  whatsapp: "",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/"
};

const MESSAGE_PAR_DEFAUT = "Bonjour Chez Wieme, je voudrais passer une commande.";

/* Envoi automatique de la commande sur le WhatsApp de Chez Wieme
   dès que le client valide. Mettre false pour désactiver. */
const AUTO_WHATSAPP = true;

/* Envoi automatique du récapitulatif par e-mail au client (EmailJS).
   Créez un compte gratuit sur https://www.emailjs.com/ puis collez ici
   les trois identifiants ci-dessous. Tant qu'ils sont vides, le bouton
   « Recevoir le récapitulatif par e-mail » (mailto) reste disponible. */
const EMAILJS = {
  publicKey: "jGgWOq1DORW2KJuoB",
  serviceId: "service_yin7w96",
  templateId: "template_ahtpxa"
};

/* Livraison de démonstration. Modifiez ces deux montants si besoin.
   Les montants sont en centimes de dinar : 700 = 7,00 DT. */
const DELIVERY = {
  feeCents: 700,
  freeFromCents: 10000
};

const ORDER_PREFIX = "CW";
const VERIFICATION_CODE = "123456";
const MAX_QUANTITY = 20;

const STORAGE_KEYS = {
  users: "chezWieme.users",
  session: "chezWieme.session",
  cart: "chezWieme.cart",
  orders: "chezWieme.orders",
  pending: "chezWieme.pendingVerification"
};

/* ---------------------------------------------------------
   2. CATALOGUE LOCAL
   Les prix sont ceux affichés sur le site (en centimes de dinar).
   --------------------------------------------------------- */
const CATALOG = [
  {
    id: "couscous",
    name: "Couscous poulet et légumes",
    category: "plats-principaux",
    categoryLabel: "Plat principal",
    priceCents: 1200,
    emoji: "🍛",
    visual: "couscous",
    image: "images/couscous.jpg",
    badge: "Le classique",
    shortDescription: "Poulet tendre, légumes de saison et semoule fine.",
    description:
      "Un couscous généreux préparé en cuisine : semoule fine, poulet tendre, carottes, courgettes et pois chiches. Un classique qui réchauffe et qui rassasie.",
    features: ["Poulet et légumes de saison", "Semoule fine", "Préparé maison"],
    available: true
  },
  {
    id: "riz-poulet",
    name: "Riz au poulet mariné",
    category: "plats-principaux",
    categoryLabel: "Plat principal",
    priceCents: 1000,
    emoji: "🍚",
    visual: "riz",
    image: "images/image-3.jpg",
    badge: "La signature",
    shortDescription: "Riz parfumé, poulet mariné et petits légumes.",
    description:
      "Riz parfumé, poulet mariné, poivrons et petits pois. Un plat complet, facile à emporter et à déguster entre deux cours.",
    features: ["Poulet mariné", "Riz parfumé", "Format facile à emporter"],
    available: true
  },
  {
    id: "ojja-merguez",
    name: "Ojja merguez",
    category: "plats-principaux",
    categoryLabel: "Plat principal",
    priceCents: 900,
    emoji: "🍳",
    visual: "ojja",
    image: "images/ojja.jpg",
    badge: "Pour les gourmands",
    shortDescription: "Œufs, tomates, poivrons et merguez, avec du pain frais.",
    description:
      "Œufs, tomates, poivrons et merguez, servis avec du pain frais. Pour les amateurs de saveurs relevées et de plats qui réchauffent.",
    features: ["Merguez et œufs", "Sauce tomate maison", "Servi avec du pain frais"],
    available: true
  },
  {
    id: "abonnement-5-repas",
    name: "Abonnement 5 repas",
    category: "formules-etudiantes",
    categoryLabel: "Formule étudiante",
    priceCents: 4500,
    priceNote: "par semaine",
    emoji: "🍱",
    visual: "formule",
    badge: "5 repas",
    shortDescription: "Cinq repas au choix, du lundi au vendredi.",
    description:
      "Choisissez cinq plats dans la carte, du lundi au vendredi. Votre menu est confirmé chaque semaine. Une formule simple pour bien manger sans y penser.",
    features: [
      "5 repas au choix par semaine",
      "Livraison au foyer ou à la faculté",
      "Menu confirmé chaque semaine"
    ],
    available: true
  }
];

const CATEGORIES = {
  "plats-principaux": {
    label: "Plats principaux",
    title: "Les plats principaux",
    description:
      "Des recettes généreuses, préparées maison, à choisir selon votre envie du jour.",
    href: "plats-principaux.html",
    emoji: "🍛",
    cardClass: "category-card--plats"
  },
  "formules-etudiantes": {
    label: "Formules étudiantes",
    title: "Les formules étudiantes",
    description:
      "Une semaine de repas déjà pensée pour les étudiants du foyer et de la faculté.",
    href: "formules-etudiantes.html",
    emoji: "🍱",
    cardClass: "category-card--formules"
  }
};

/* ---------------------------------------------------------
   3. OUTILS GÉNÉRAUX
   --------------------------------------------------------- */
function formatPrice(cents) {
  return (Number(cents) / 100).toFixed(2).replace(".", ",") + " DT";
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value == null ? fallback : value;
  } catch (error) {
    console.warn("Donnée locale illisible :", key, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Impossible d'enregistrer dans le navigateur :", key, error);
  }
}

function uid(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return prefix + "_" + Date.now().toString(36) + "_" + random;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getProduct(productId) {
  return CATALOG.find(function (product) {
    return product.id === productId;
  });
}

function getCategory(categoryId) {
  return CATEGORIES[categoryId] || null;
}

/* Met un numéro saisi au format international (Tunisie par défaut).
   "20123456" -> "21620123456", "+216 20 123 456" -> "21620123456". */
function numeroInternational(numero) {
  const chiffres = String(numero || "").replace(/\D/g, "");
  if (!chiffres) return "";
  if (chiffres.indexOf("00") === 0) return chiffres.slice(2);
  if (chiffres.indexOf("216") === 0) return chiffres;
  if (chiffres.length === 8) return "216" + chiffres;
  return chiffres;
}

/* Construit un lien WhatsApp vers un numéro précis, message déjà écrit. */
function lienWhatsAppNumero(numero, message) {
  const texte = encodeURIComponent(message);
  const destination = numeroInternational(numero);
  if (destination) return "https://wa.me/" + destination + "?text=" + texte;
  return "https://wa.me/?text=" + texte;
}

/* Construit un lien WhatsApp avec un message déjà écrit.
   Sans numéro configuré, WhatsApp s'ouvre et le client choisit le contact. */
function lienWhatsApp(message) {
  return lienWhatsAppNumero(CONTACT.whatsapp, message);
}

/* Récapitulatif de commande, prêt à envoyer sur WhatsApp. */
function messageCommande(order) {
  const lignes = [
    "Bonjour Chez Wieme !",
    "Nouvelle commande " + order.reference,
    ""
  ];

  order.items.forEach(function (item) {
    lignes.push("• " + item.name + " × " + item.quantity + " — " + formatPrice(item.lineTotalCents));
  });

  lignes.push("");
  lignes.push("Sous-total : " + formatPrice(order.subtotalCents));
  lignes.push("Livraison : " + (order.deliveryFeeCents === 0 ? "offerte" : formatPrice(order.deliveryFeeCents)));
  lignes.push("Total : " + formatPrice(order.totalCents));
  lignes.push("");
  lignes.push("Client : " + order.customer.firstName + " " + order.customer.lastName);
  lignes.push("Téléphone : " + order.customer.phone);
  lignes.push("Adresse : " + order.customer.address + ", " + order.customer.postalCode + " " + order.customer.city + ", " + order.customer.country);
  if (order.customer.notes) lignes.push("Remarque : " + order.customer.notes);
  lignes.push("Paiement : " + order.paymentLabel);

  return lignes.join("\n");
}

/* Récapitulatif envoyé au client sur son propre WhatsApp. */
function messageClient(order) {
  const lignes = [
    "Bonjour " + order.customer.firstName + " !",
    "Merci pour ta commande " + order.reference + " chez Chez Wieme.",
    ""
  ];

  order.items.forEach(function (item) {
    lignes.push("• " + item.name + " × " + item.quantity + " — " + formatPrice(item.lineTotalCents));
  });

  lignes.push("");
  lignes.push("Sous-total : " + formatPrice(order.subtotalCents));
  lignes.push("Livraison : " + (order.deliveryFeeCents === 0 ? "offerte" : formatPrice(order.deliveryFeeCents)));
  lignes.push("Total : " + formatPrice(order.totalCents));
  lignes.push("");
  lignes.push("Livraison : " + order.customer.address + ", " + order.customer.postalCode + " " + order.customer.city + ", " + order.customer.country);
  lignes.push("Paiement : " + order.paymentLabel);
  lignes.push("");
  lignes.push("À bientôt !");
  lignes.push("Chez Wieme — cuisine maison, livraison étudiante");

  return lignes.join("\n");
}

/* Version email du récapitulatif, envoyée au client. */
function emailCommande(order) {
  const sujet = "Chez Wieme — commande " + order.reference;
  const corps = [
    "Bonjour " + order.customer.firstName + ",",
    "",
    "Nous avons bien reçu votre commande " + order.reference + ".",
    "",
  ];

  order.items.forEach(function (item) {
    corps.push("- " + item.name + " × " + item.quantity + " : " + formatPrice(item.lineTotalCents));
  });

  corps.push("");
  corps.push("Sous-total : " + formatPrice(order.subtotalCents));
  corps.push("Livraison : " + (order.deliveryFeeCents === 0 ? "offerte" : formatPrice(order.deliveryFeeCents)));
  corps.push("Total : " + formatPrice(order.totalCents));
  corps.push("");
  corps.push("Livraison à : " + order.customer.address + ", " + order.customer.postalCode + " " + order.customer.city + ", " + order.customer.country);
  corps.push("Paiement : " + order.paymentLabel);
  corps.push("");
  corps.push("Merci et à bientôt !");
  corps.push("Chez Wieme — cuisine maison, livraison étudiante");

  return { subject: sujet, body: corps.join("\n") };
}

/* ---------------------------------------------------------
   Envoi automatique de l'e-mail au client (EmailJS)
   --------------------------------------------------------- */
function emailAutoPret() {
  return Boolean(EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId);
}

function chargerEmailJS() {
  if (window.emailjs) return Promise.resolve(window.emailjs);
  if (!emailAutoPret()) return Promise.resolve(null);
  return new Promise(function (resolve) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.async = true;
    script.onload = function () {
      try {
        window.emailjs.init({ publicKey: EMAILJS.publicKey });
        resolve(window.emailjs);
      } catch (error) {
        resolve(null);
      }
    };
    script.onerror = function () { resolve(null); };
    document.head.appendChild(script);
  });
}

function envoyerEmailCommande(order) {
  if (!emailAutoPret()) return Promise.resolve({ ok: false, erreur: "EmailJS non configure." });
  return chargerEmailJS().then(function (lib) {
    if (!lib) return { ok: false, erreur: "SDK EmailJS introuvable." };
    const mail = emailCommande(order);
    return lib
      .send(EMAILJS.serviceId, EMAILJS.templateId, {
        to_email: order.customer.email,
        to_name: order.customer.firstName + " " + order.customer.lastName,
        shop_name: "Chez Wieme",
        order_reference: order.reference,
        order_subject: mail.subject,
        order_body: mail.body,
        order_total: formatPrice(order.totalCents)
      })
      .then(function () { return { ok: true }; })
      .catch(function (err) {
        let message = "erreur inconnue";
        try {
          if (err) {
            if (err.message) message = err.message;
            else if (err.error) message = (err.error && err.error.message) ? err.error.message : JSON.stringify(err.error);
            else message = JSON.stringify(err);
          }
        } catch (e) { message = "erreur inconnue"; }
        return { ok: false, erreur: message };
      });
  });
}

function updateOrder(order) {
  const orders = getOrders();
  const index = orders.findIndex(function (item) { return item.id === order.id; });
  if (index === -1) return;
  orders[index] = order;
  saveOrders(orders);
}

/* Redirection interne sûre (évite les liens externes). */
function safeNext(value, fallback) {
  if (!value) return fallback;
  try {
    const url = new URL(value, window.location.href);
    if (url.origin !== window.location.origin) return fallback;
    const file = url.pathname.split("/").pop() || "";
    if (!/^[a-z0-9-]+\.html$/i.test(file)) return fallback;
    return file + url.search + url.hash;
  } catch (error) {
    return fallback;
  }
}

function showToast(message, linkHref, linkLabel) {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  if (linkHref) {
    const link = document.createElement("a");
    link.href = linkHref;
    link.textContent = linkLabel || "Voir";
    toast.appendChild(link);
  }

  document.body.appendChild(toast);
  window.setTimeout(function () {
    toast.remove();
  }, 3800);
}

/* ---------------------------------------------------------
   4. PANIER (localStorage)
   --------------------------------------------------------- */
function getCart() {
  const cart = readJSON(STORAGE_KEYS.cart, []);
  if (!Array.isArray(cart)) return [];

  return cart
    .filter(function (item) {
      return item && typeof item.productId === "string";
    })
    .map(function (item) {
      return {
        productId: item.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, Number(item.quantity) || 1))
      };
    });
}

function saveCart(cart) {
  writeJSON(STORAGE_KEYS.cart, cart);
  updateCartCount();
  document.dispatchEvent(new CustomEvent("cart:updated"));
}

function addToCart(productId, quantity) {
  const product = getProduct(productId);
  const amount = Math.max(1, Number(quantity) || 1);

  if (!product || !product.available) {
    showToast("Ce produit n'est pas disponible.");
    return false;
  }

  const cart = getCart();
  const existing = cart.find(function (item) {
    return item.productId === productId;
  });

  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + amount);
  } else {
    cart.push({ productId: productId, quantity: Math.min(MAX_QUANTITY, amount) });
  }

  saveCart(cart);
  showToast(product.name + " a été ajouté au panier.", "panier.html", "Voir le panier");
  return true;
}

function setCartQuantity(productId, quantity) {
  const amount = Number(quantity);
  if (!Number.isFinite(amount) || amount < 1) {
    removeFromCart(productId);
    return;
  }

  const cart = getCart();
  const item = cart.find(function (entry) {
    return entry.productId === productId;
  });

  if (!item) return;
  item.quantity = Math.min(MAX_QUANTITY, Math.floor(amount));
  saveCart(cart);
}

function removeFromCart(productId) {
  saveCart(
    getCart().filter(function (item) {
      return item.productId !== productId;
    })
  );
}

function cartCount() {
  return getCart().reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
}

function getCartDetails() {
  return getCart()
    .map(function (item) {
      const product = getProduct(item.productId);
      if (!product || !product.available) return null;
      return {
        product: product,
        quantity: item.quantity,
        lineTotalCents: product.priceCents * item.quantity
      };
    })
    .filter(Boolean);
}

function cartSubtotalCents() {
  return getCartDetails().reduce(function (total, item) {
    return total + item.lineTotalCents;
  }, 0);
}

function deliveryFeeFor(subtotalCents) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= DELIVERY.freeFromCents ? 0 : DELIVERY.feeCents;
}

function cartTotalCents() {
  const subtotal = cartSubtotalCents();
  return subtotal + deliveryFeeFor(subtotal);
}

function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
    badge.textContent = String(count);
    badge.dataset.empty = count === 0 ? "true" : "false";
  });

  document.querySelectorAll("[data-cart-link]").forEach(function (link) {
    link.setAttribute(
      "aria-label",
      count === 0 ? "Mon panier, vide" : "Mon panier, " + count + (count > 1 ? " articles" : " article")
    );
  });
}

/* ---------------------------------------------------------
   5. COMPTES SIMULÉS (localStorage)
   --------------------------------------------------------- */
function getUsers() {
  const users = readJSON(STORAGE_KEYS.users, []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  writeJSON(STORAGE_KEYS.users, users);
}

/* Empreinte de démonstration : ne remplace pas un vrai hachage serveur. */
async function hashPassword(email, password) {
  const text = "chez-wieme-demo::" + email.trim().toLowerCase() + "::" + password;

  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    const data = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  // Solution de secours si le navigateur refuse Web Crypto.
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return "fallback-" + (hash >>> 0).toString(16);
}

async function registerUser(data) {
  const email = data.email.trim().toLowerCase();
  const users = getUsers();

  if (users.some(function (user) { return user.email === email; })) {
    throw new Error("Un compte existe déjà avec cette adresse e-mail.");
  }

  const user = {
    id: uid("user"),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: email,
    passwordHash: await hashPassword(email, data.password),
    verified: false,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);
  writeJSON(STORAGE_KEYS.pending, { email: email });
  return user;
}

function verifyUser(email, code) {
  const normalized = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find(function (entry) { return entry.email === normalized; });

  if (!user) throw new Error("Aucun compte ne correspond à cette adresse.");
  if (user.verified) return user;
  if (code.trim() !== VERIFICATION_CODE) {
    throw new Error("Le code est incorrect. Pour cette démonstration, utilisez 123456.");
  }

  user.verified = true;
  saveUsers(users);
  localStorage.removeItem(STORAGE_KEYS.pending);
  return user;
}

async function loginUser(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = getUsers().find(function (entry) { return entry.email === normalized; });

  if (!user) throw new Error("E-mail ou mot de passe incorrect.");

  const hash = await hashPassword(normalized, password);
  if (hash !== user.passwordHash) throw new Error("E-mail ou mot de passe incorrect.");
  if (!user.verified) {
    throw new Error("Votre compte n'est pas encore vérifié. Utilisez le code 123456 sur la page de vérification.");
  }

  setSession(user.id);
  return user;
}

function getSession() {
  const session = readJSON(STORAGE_KEYS.session, null);
  if (!session || !session.userId) return null;

  const user = getUsers().find(function (entry) { return entry.id === session.userId; });
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.session);
    return null;
  }
  return user;
}

function setSession(userId) {
  writeJSON(STORAGE_KEYS.session, {
    userId: userId,
    createdAt: new Date().toISOString()
  });
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

function updateAccountLink() {
  const user = getSession();

  document.querySelectorAll("[data-account-link]").forEach(function (link) {
    if (user) {
      link.href = "compte.html";
      link.dataset.logged = "true";
      link.setAttribute("aria-label", "Mon compte, " + user.firstName);
    } else {
      link.href = "connexion.html";
      link.dataset.logged = "false";
      link.setAttribute("aria-label", "Se connecter ou créer un compte");
    }
  });
}

/* ---------------------------------------------------------
   6. COMMANDES SIMULÉES (localStorage)
   --------------------------------------------------------- */
function getOrders() {
  const orders = readJSON(STORAGE_KEYS.orders, []);
  return Array.isArray(orders) ? orders : [];
}

function saveOrders(orders) {
  writeJSON(STORAGE_KEYS.orders, orders);
}

function createOrder(user, customer, paymentMethod) {
  const details = getCartDetails();
  if (!details.length) throw new Error("Votre panier est vide.");

  const subtotal = details.reduce(function (total, item) {
    return total + item.lineTotalCents;
  }, 0);
  const delivery = deliveryFeeFor(subtotal);
  const now = new Date();
  const random = Math.random().toString(36).slice(2, 4).toUpperCase();

  const order = {
    id: uid("order"),
    reference:
      ORDER_PREFIX + "-" + now.getFullYear() + "-" +
      now.getTime().toString(36).toUpperCase().slice(-6) + random,
    userId: user.id,
    createdAt: now.toISOString(),
    items: details.map(function (item) {
      return {
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        categoryLabel: item.product.categoryLabel,
        priceCents: item.product.priceCents,
        quantity: item.quantity,
        lineTotalCents: item.lineTotalCents,
        emoji: item.product.emoji,
        visual: item.product.visual
      };
    }),
    subtotalCents: subtotal,
    deliveryFeeCents: delivery,
    totalCents: subtotal + delivery,
    customer: customer,
    paymentMethod: paymentMethod,
    paymentLabel:
      paymentMethod === "demo"
        ? "Carte bancaire — démonstration"
        : "Paiement à la livraison — démonstration",
    status: "simulee",
    statusLabel: "Commande simulée"
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  return order;
}

function getOrdersForUser(userId) {
  return getOrders()
    .filter(function (order) { return order.userId === userId; })
    .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
}

function getOrderByReference(reference, userId) {
  return getOrders().find(function (order) {
    return order.reference === reference && order.userId === userId;
  }) || null;
}

/* ---------------------------------------------------------
   7. CARTES PRODUITS ET CATALOGUE
   --------------------------------------------------------- */
function createDishCard(product) {
  const article = document.createElement("article");
  article.className = "dish-card";
  article.dataset.category = product.category;
  article.id = product.id;

  const visual = document.createElement("div");
  visual.className = "dish-visual dish-visual--" + product.visual;
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", "Illustration : " + product.name);

  if (product.image) {
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";
    visual.appendChild(image);
  } else if (product.visual === "formule") {
    const mark = document.createElement("span");
    mark.className = "formula-mark";
    mark.setAttribute("aria-hidden", "true");

    const number = document.createElement("strong");
    number.textContent = "5";

    const label = document.createElement("span");
    label.textContent = "repas / semaine";

    mark.append(number, label);
    visual.appendChild(mark);
  } else {
    const emoji = document.createElement("span");
    emoji.className = "dish-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = product.emoji;
    visual.appendChild(emoji);
  }

  const badge = document.createElement("span");
  badge.className = "dish-badge" + (product.category === "formules-etudiantes" ? " dish-badge--formule" : "");
  badge.textContent = product.badge;
  visual.appendChild(badge);

  const body = document.createElement("div");
  body.className = "dish-body";

  const meta = document.createElement("div");
  meta.className = "dish-meta";

  const category = document.createElement("span");
  category.className = "dish-category";
  category.textContent = product.categoryLabel;

  const price = document.createElement("span");
  price.className = "dish-price";
  price.textContent = formatPrice(product.priceCents);
  if (product.priceNote) {
    const note = document.createElement("span");
    note.textContent = " " + product.priceNote;
    price.appendChild(note);
  }

  meta.append(category, price);

  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = "plat.html?id=" + encodeURIComponent(product.id);
  titleLink.textContent = product.name;
  title.appendChild(titleLink);

  const description = document.createElement("p");
  description.textContent = product.shortDescription;

  const actions = document.createElement("div");
  actions.className = "dish-actions";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn btn-primary btn-small";
  addButton.dataset.addToCart = product.id;
  addButton.textContent = "Ajouter au panier";

  const viewLink = document.createElement("a");
  viewLink.className = "icon-btn";
  viewLink.href = "plat.html?id=" + encodeURIComponent(product.id);
  viewLink.setAttribute("aria-label", "Voir le détail de " + product.name);
  viewLink.textContent = "→";

  actions.append(addButton, viewLink);
  body.append(meta, title, description, actions);
  article.append(visual, body);
  return article;
}

function renderCatalog() {
  document.querySelectorAll("[data-catalog]").forEach(function (grid) {
    const mode = grid.dataset.catalog || "all";
    let products = CATALOG.filter(function (product) { return product.available; });

    if (mode === "featured") {
      products = products.filter(function (product) {
        return product.category === "plats-principaux";
      }).slice(0, 3);
    } else if (mode !== "all") {
      products = products.filter(function (product) { return product.category === mode; });
    }

    grid.replaceChildren.apply(
      grid,
      products.map(function (product) { return createDishCard(product); })
    );

    if (!products.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<span class=\"empty-state-icon\">🍽️</span><h2>Rien ici pour le moment.</h2><p>Revenez bientôt : la carte change au fil des semaines.</p>";
      grid.appendChild(empty);
    }
  });
}

function applyFilter(filter) {
  const cards = document.querySelectorAll("[data-catalog] .dish-card");

  cards.forEach(function (card) {
    card.hidden = filter !== "tous" && card.dataset.category !== filter;
  });

  updateFilterCount();
}

function updateFilterCount() {
  const counter = document.getElementById("filter-count");
  if (!counter) return;

  const visible = Array.from(document.querySelectorAll("[data-catalog] .dish-card")).filter(function (card) {
    return !card.hidden;
  });

  const plates = visible.filter(function (card) {
    return card.dataset.category === "plats-principaux";
  }).length;
  const formulas = visible.filter(function (card) {
    return card.dataset.category === "formules-etudiantes";
  }).length;

  const parts = [];
  if (plates) parts.push(plates + (plates > 1 ? " plats" : " plat"));
  if (formulas) parts.push(formulas + (formulas > 1 ? " formules" : " formule"));

  counter.textContent =
    (parts.length ? parts.join(" et ") : "Aucun résultat") +
    (visible.length > 1 ? " affichés" : " affiché");
}

function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      applyFilter(button.dataset.filter || "tous");
    });
  });

  applyFilter("tous");
}

/* ---------------------------------------------------------
   8. PAGE DÉTAIL D'UN PRODUIT
   --------------------------------------------------------- */
function initDetailPage() {
  const root = document.querySelector("[data-product-detail]");
  if (!root) return;

  const product = getProduct(getParam("id"));
  const missing = document.querySelector("[data-detail-missing]");

  if (!product || !product.available) {
    root.hidden = true;
    if (missing) missing.hidden = false;
    return;
  }

  document.title = product.name + " — Chez Wieme";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = product.shortDescription + " Commandez chez Wieme.";

  const setText = function (selector, text) {
    const element = root.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText("[data-detail-category]", product.categoryLabel);
  setText("[data-detail-name]", product.name);
  setText("[data-detail-description]", product.description);
  setText("[data-detail-price]", formatPrice(product.priceCents));
  setText("[data-detail-price-note]", product.priceNote || "TTC");

  const emoji = root.querySelector("[data-detail-emoji]");
  if (emoji) {
    emoji.textContent = product.emoji;
    emoji.hidden = Boolean(product.image);
  }

  const photo = root.querySelector("[data-detail-image]");
  if (photo) {
    if (product.image) {
      photo.src = product.image;
      photo.alt = "";
      photo.hidden = false;
    } else {
      photo.removeAttribute("src");
      photo.hidden = true;
    }
  }

  const visual = root.querySelector("[data-detail-visual]");
  if (visual) {
    visual.className = "detail-visual dish-visual--" + product.visual;
    visual.setAttribute("aria-label", "Illustration : " + product.name);
  }

  const features = root.querySelector("[data-detail-features]");
  if (features) {
    features.replaceChildren.apply(
      features,
      product.features.map(function (feature) {
        const item = document.createElement("li");
        item.textContent = feature;
        return item;
      })
    );
  }

  const category = getCategory(product.category);
  const categoryLink = root.querySelector("[data-detail-category-link]");
  if (category && categoryLink) {
    categoryLink.href = category.href;
    categoryLink.textContent = category.label;
  }

  let quantity = 1;
  const quantityLabel = root.querySelector("[data-detail-qty]");
  const minus = root.querySelector("[data-detail-minus]");
  const plus = root.querySelector("[data-detail-plus]");

  function updateQuantity() {
    if (quantityLabel) quantityLabel.textContent = String(quantity);
  }

  if (minus) {
    minus.addEventListener("click", function () {
      quantity = Math.max(1, quantity - 1);
      updateQuantity();
    });
  }

  if (plus) {
    plus.addEventListener("click", function () {
      quantity = Math.min(MAX_QUANTITY, quantity + 1);
      updateQuantity();
    });
  }

  const addButton = root.querySelector("[data-detail-add]");
  if (addButton) {
    addButton.addEventListener("click", function () {
      addToCart(product.id, quantity);
    });
  }

  const whatsapp = root.querySelector("[data-detail-whatsapp]");
  if (whatsapp) {
    whatsapp.href = lienWhatsApp(
      "Bonjour Chez Wieme, je voudrais commander : " + product.name +
      " (" + formatPrice(product.priceCents) + ")."
    );
  }

  const related = document.querySelector("[data-related]");
  if (related) {
    const others = CATALOG.filter(function (entry) {
      return entry.id !== product.id && entry.available;
    }).slice(0, 3);
    related.replaceChildren.apply(
      related,
      others.map(function (entry) { return createDishCard(entry); })
    );
  }
}

/* ---------------------------------------------------------
   9. PAGE PANIER
   --------------------------------------------------------- */
function renderCartPage() {
  const page = document.querySelector("[data-cart-page]");
  if (!page) return;

  const list = page.querySelector("[data-cart-list]");
  const empty = page.querySelector("[data-cart-empty]");
  const content = page.querySelector("[data-cart-content]");
  const details = getCartDetails();

  if (!details.length) {
    if (empty) empty.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (content) content.hidden = false;
  if (!list) return;

  list.replaceChildren.apply(
    list,
    details.map(function (item) {
      const row = document.createElement("article");
      row.className = "cart-row";

      const thumb = document.createElement("div");
      thumb.className = "cart-thumb" +
        (item.product.category === "formules-etudiantes" ? " cart-thumb--formule" : "");
      thumb.setAttribute("aria-hidden", "true");

      if (item.product.image) {
        const thumbImage = document.createElement("img");
        thumbImage.src = item.product.image;
        thumbImage.alt = "";
        thumbImage.loading = "lazy";
        thumb.appendChild(thumbImage);
      } else {
        thumb.textContent = item.product.emoji;
      }

      const info = document.createElement("div");
      info.className = "cart-info";

      const title = document.createElement("h3");
      const titleLink = document.createElement("a");
      titleLink.href = "plat.html?id=" + encodeURIComponent(item.product.id);
      titleLink.textContent = item.product.name;
      title.appendChild(titleLink);

      const category = document.createElement("p");
      category.textContent = item.product.categoryLabel;

      const unit = document.createElement("span");
      unit.className = "cart-unit";
      unit.textContent = "Prix unitaire : " + formatPrice(item.product.priceCents);

      info.append(title, category, unit);

      const controls = document.createElement("div");
      controls.className = "cart-controls";

      const quantity = document.createElement("div");
      quantity.className = "qty-control";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.dataset.cartAction = "minus";
      minus.dataset.productId = item.product.id;
      minus.setAttribute("aria-label", "Diminuer la quantité de " + item.product.name);
      minus.textContent = "−";

      const value = document.createElement("span");
      value.textContent = String(item.quantity);
      value.setAttribute("aria-live", "polite");

      const plus = document.createElement("button");
      plus.type = "button";
      plus.dataset.cartAction = "plus";
      plus.dataset.productId = item.product.id;
      plus.setAttribute("aria-label", "Augmenter la quantité de " + item.product.name);
      plus.textContent = "+";

      quantity.append(minus, value, plus);

      const lineTotal = document.createElement("span");
      lineTotal.className = "cart-line-total";
      lineTotal.textContent = formatPrice(item.lineTotalCents);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.dataset.cartAction = "remove";
      remove.dataset.productId = item.product.id;
      remove.textContent = "Supprimer";

      controls.append(quantity, lineTotal, remove);
      row.append(thumb, info, controls);
      return row;
    })
  );

  const subtotal = cartSubtotalCents();
  const delivery = deliveryFeeFor(subtotal);
  const total = subtotal + delivery;

  const setText = function (selector, text) {
    const element = page.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText("[data-cart-subtotal]", formatPrice(subtotal));
  setText("[data-cart-delivery]", delivery === 0 ? "Offerte" : formatPrice(delivery));
  setText("[data-cart-total]", formatPrice(total));

  const freeShipping = page.querySelector("[data-free-shipping]");
  if (freeShipping) {
    if (delivery === 0) {
      freeShipping.textContent = "🎉 La livraison est offerte sur cette commande.";
      freeShipping.classList.add("free-shipping--reached");
    } else {
      freeShipping.textContent =
        "Plus que " + formatPrice(DELIVERY.freeFromCents - subtotal) +
        " pour bénéficier de la livraison offerte.";
      freeShipping.classList.remove("free-shipping--reached");
    }
  }

  const checkout = page.querySelector("[data-cart-checkout]");
  if (checkout) {
    const user = getSession();
    checkout.href = user ? "commande.html" : "connexion.html?next=commande.html";
    const note = page.querySelector("[data-cart-checkout-note]");
    if (note) {
      note.textContent = user
        ? "Vous êtes connecté : la prochaine étape est le formulaire de livraison."
        : "Vous devrez vous connecter avant de finaliser la commande. Votre panier est conservé.";
    }
  }
}

function initCartPage() {
  const page = document.querySelector("[data-cart-page]");
  if (!page) return;

  const list = page.querySelector("[data-cart-list]");
  if (list) {
    list.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-cart-action]");
      if (!button) return;

      const productId = button.dataset.productId;
      const action = button.dataset.cartAction;
      const item = getCartDetails().find(function (entry) {
        return entry.product.id === productId;
      });
      if (!item) return;

      if (action === "minus") setCartQuantity(productId, item.quantity - 1);
      if (action === "plus") setCartQuantity(productId, item.quantity + 1);
      if (action === "remove") removeFromCart(productId);
    });
  }

  document.addEventListener("cart:updated", renderCartPage);
  renderCartPage();
}

/* ---------------------------------------------------------
   10. PAGE CHECKOUT
   --------------------------------------------------------- */
function renderCheckoutSummary() {
  const page = document.querySelector("[data-checkout-page]");
  if (!page) return;

  const details = getCartDetails();
  const items = page.querySelector("[data-checkout-items]");
  const subtotal = cartSubtotalCents();
  const delivery = deliveryFeeFor(subtotal);
  const total = subtotal + delivery;

  if (items) {
    items.replaceChildren.apply(
      items,
      details.map(function (item) {
        const row = document.createElement("div");
        row.className = "checkout-item";

        const emoji = document.createElement("span");
        emoji.className = "checkout-item-emoji";
        emoji.setAttribute("aria-hidden", "true");

        if (item.product.image) {
          const image = document.createElement("img");
          image.src = item.product.image;
          image.alt = "";
          image.loading = "lazy";
          emoji.appendChild(image);
        } else {
          emoji.textContent = item.product.emoji;
        }

        const text = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = item.product.name;
        const quantity = document.createElement("p");
        quantity.textContent = item.quantity + " × " + formatPrice(item.product.priceCents);
        text.append(name, quantity);

        const line = document.createElement("strong");
        line.textContent = formatPrice(item.lineTotalCents);

        row.append(emoji, text, line);
        return row;
      })
    );
  }

  const setText = function (selector, text) {
    const element = page.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText("[data-checkout-subtotal]", formatPrice(subtotal));
  setText("[data-checkout-delivery]", delivery === 0 ? "Offerte" : formatPrice(delivery));
  setText("[data-checkout-total]", formatPrice(total));
}

function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById("erreur-" + inputId);

  if (input) {
    input.classList.toggle("input-error", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  if (error) error.textContent = message || "";
}

function initCheckoutPage() {
  const page = document.querySelector("[data-checkout-page]");
  if (!page) return;

  const user = getSession();
  if (!user) {
    window.location.replace("connexion.html?next=commande.html");
    return;
  }

  if (!getCartDetails().length) {
    const content = page.querySelector("[data-checkout-content]");
    const empty = page.querySelector("[data-checkout-empty]");
    if (content) content.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  const firstName = document.getElementById("checkout-prenom");
  const lastName = document.getElementById("checkout-nom");
  const email = document.getElementById("checkout-email");

  if (firstName) firstName.value = user.firstName || "";
  if (lastName) lastName.value = user.lastName || "";
  if (email) email.value = user.email || "";

  renderCheckoutSummary();

  const form = page.querySelector("[data-checkout-form]");
  if (!form) return;

  let submitting = false;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitting) return;

    const errorBox = page.querySelector("[data-checkout-error]");
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }

    const values = {
      firstName: (document.getElementById("checkout-prenom") || {}).value || "",
      lastName: (document.getElementById("checkout-nom") || {}).value || "",
      email: (document.getElementById("checkout-email") || {}).value || "",
      phone: (document.getElementById("checkout-telephone") || {}).value || "",
      address: (document.getElementById("checkout-adresse") || {}).value || "",
      city: (document.getElementById("checkout-ville") || {}).value || "",
      postalCode: (document.getElementById("checkout-codepostal") || {}).value || "",
      country: (document.getElementById("checkout-pays") || {}).value || "Tunisie",
      notes: (document.getElementById("checkout-notes") || {}).value || ""
    };

    let valid = true;

    function check(id, condition, message) {
      if (!condition) {
        setFieldError(id, message);
        valid = false;
      } else {
        setFieldError(id, "");
      }
    }

    check("checkout-prenom", values.firstName.trim().length >= 2, "Indiquez votre prénom.");
    check("checkout-nom", values.lastName.trim().length >= 2, "Indiquez votre nom.");
    check("checkout-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()), "Indiquez une adresse e-mail valide.");
    check("checkout-telephone", values.phone.replace(/[^\d+]/g, "").length >= 8, "Indiquez un numéro de téléphone valide.");
    check("checkout-adresse", values.address.trim().length >= 5, "Indiquez votre adresse de livraison.");
    check("checkout-ville", values.city.trim().length >= 2, "Indiquez votre ville.");
    check("checkout-codepostal", values.postalCode.trim().length >= 4, "Indiquez un code postal valide.");
    check("checkout-pays", values.country.trim().length >= 2, "Indiquez votre pays.");

    const payment = form.querySelector('input[name="paiement"]:checked');
    if (!payment) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = "Choisissez un moyen de paiement simulé.";
      }
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector(".input-error");
      if (firstError) firstError.focus();
      return;
    }

    if (!getCartDetails().length) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = "Votre panier est vide. Ajoutez un plat avant de commander.";
      }
      return;
    }

    submitting = true;
    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit ? submit.textContent : "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Traitement de la commande…";
    }

    try {
      const order = createOrder(
        user,
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim(),
          notes: values.notes.trim()
        },
        payment ? payment.value : "livraison"
      );

      saveCart([]);

      /* Ouvre WhatsApp avec la commande déjà écrite (nouvel onglet),
         puis affiche la page de confirmation. */
      if (AUTO_WHATSAPP) {
        try {
          window.open(lienWhatsApp(messageCommande(order)), "_blank", "noopener");
        } catch (error) {
          /* navigateur bloquant : le bouton sur la confirmation reste disponible */
        }
      }

      window.location.href = "confirmation.html?ref=" + encodeURIComponent(order.reference);
    } catch (error) {
      submitting = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = error.message || "La commande n'a pas pu être enregistrée. Réessayez.";
      }
    }
  });
}

/* ---------------------------------------------------------
   11. PAGE CONFIRMATION
   --------------------------------------------------------- */
function initConfirmationPage() {
  const page = document.querySelector("[data-confirmation-page]");
  if (!page) return;

  const user = getSession();
  const reference = getParam("ref");

  if (!user) {
    window.location.replace(
      "connexion.html?next=" + encodeURIComponent("confirmation.html?ref=" + (reference || ""))
    );
    return;
  }

  const order = reference ? getOrderByReference(reference, user.id) : null;
  const content = page.querySelector("[data-confirmation-content]");
  const missing = page.querySelector("[data-confirmation-missing]");

  if (!order) {
    if (content) content.hidden = true;
    if (missing) missing.hidden = false;
    return;
  }

  if (content) content.hidden = false;
  if (missing) missing.hidden = true;

  const setText = function (selector, text) {
    const element = page.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText("[data-confirmation-reference]", order.reference);
  setText("[data-confirmation-date]", formatDate(order.createdAt));
  setText("[data-confirmation-total]", formatPrice(order.totalCents));
  setText("[data-confirmation-subtotal]", formatPrice(order.subtotalCents));
  setText("[data-confirmation-delivery]", order.deliveryFeeCents === 0 ? "Offerte" : formatPrice(order.deliveryFeeCents));
  setText("[data-confirmation-payment]", order.paymentLabel);
  setText("[data-confirmation-email]", order.customer.email);
  setText("[data-confirmation-phone]", order.customer.phone);

  const items = page.querySelector("[data-confirmation-items]");
  if (items) {
    items.replaceChildren.apply(
      items,
      order.items.map(function (item) {
        const row = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = item.name + " × " + item.quantity;
        const total = document.createElement("strong");
        total.textContent = formatPrice(item.lineTotalCents);
        row.append(label, total);
        return row;
      })
    );
  }

  const address = page.querySelector("[data-confirmation-address]");
  if (address) {
    const customer = order.customer;
    const lines = [
      customer.firstName + " " + customer.lastName,
      customer.address,
      customer.postalCode + " " + customer.city + ", " + customer.country,
      "Téléphone : " + customer.phone
    ];
    if (customer.notes) lines.push("Remarque : " + customer.notes);
    address.textContent = lines.join(" · ");
  }

  /* Envoi de la commande : WhatsApp vers Chez Wieme + récap au client. */
  const whatsappLink = page.querySelector("[data-order-whatsapp]");
  if (whatsappLink) {
    whatsappLink.href = lienWhatsApp(messageCommande(order));
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener";
  }

  /* Récapitulatif sur le WhatsApp du client (son propre numéro). */
  const clientLink = page.querySelector("[data-client-whatsapp]");
  if (clientLink) {
    const numeroClient = numeroInternational(order.customer.phone);
    clientLink.href = lienWhatsAppNumero(order.customer.phone, messageClient(order));
    clientLink.target = "_blank";
    clientLink.rel = "noopener";
    if (!numeroClient) clientLink.hidden = true;
  }

  const mailLink = page.querySelector("[data-order-mail]");
  if (mailLink) {
    const mail = emailCommande(order);
    mailLink.href =
      "mailto:" + encodeURIComponent(order.customer.email) +
      "?subject=" + encodeURIComponent(mail.subject) +
      "&body=" + encodeURIComponent(mail.body);
  }

  /* E-mail automatique au client : envoyé une seule fois par commande. */
  const emailStatus = page.querySelector("[data-email-status]");

  function afficherStatutEmail(texte, type) {
    if (!emailStatus) return;
    emailStatus.hidden = false;
    emailStatus.className = "email-status is-" + type;
    emailStatus.textContent = texte;
  }

  if (emailStatus) {
    if (order.emailStatus === "envoye") {
      afficherStatutEmail(
        "📧 Récapitulatif envoyé à " + order.customer.email + ".",
        "ok"
      );
    } else if (emailAutoPret()) {
      afficherStatutEmail(
        "Envoi du récapitulatif à " + order.customer.email + "…",
        "info"
      );
      envoyerEmailCommande(order).then(function (result) {
        const ok = Boolean(result && result.ok);
        order.emailStatus = ok ? "envoye" : "echec";
        order.emailSentAt = ok ? new Date().toISOString() : null;
        updateOrder(order);
        if (ok) {
          afficherStatutEmail(
            "📧 Récapitulatif envoyé à " + order.customer.email + ". Pense à vérifier les spams.",
            "ok"
          );
        } else {
          afficherStatutEmail(
            "L'e-mail n'a pas pu être envoyé automatiquement (" + (result && result.erreur ? result.erreur : "erreur inconnue") + "). Utilise le bouton e-mail ci-dessus.",
            "error"
          );
        }
      });
    } else {
      afficherStatutEmail(
        "L'envoi automatique par e-mail n'est pas encore activé : utilise le bouton e-mail ci-dessus.",
        "info"
      );
    }
  }
}

/* ---------------------------------------------------------
   12. ESPACE COMPTE
   --------------------------------------------------------- */
function initAccountPage() {
  const page = document.querySelector("[data-account-page]");
  if (!page) return;

  const user = getSession();
  if (!user) {
    window.location.replace("connexion.html?next=compte.html");
    return;
  }

  const setText = function (selector, text) {
    const element = page.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText("[data-account-firstname]", user.firstName);
  setText("[data-account-fullname]", user.firstName + " " + user.lastName);
  setText("[data-account-email]", user.email);
  setText("[data-account-since]", formatDate(user.createdAt));
  setText("[data-account-status]", user.verified ? "Vérifié (démo)" : "Non vérifié");

  const orders = getOrdersForUser(user.id);
  const list = page.querySelector("[data-account-orders]");
  const empty = page.querySelector("[data-account-orders-empty]");

  if (!orders.length) {
    if (list) list.hidden = true;
    if (empty) empty.hidden = false;
  } else if (list) {
    list.hidden = false;
    if (empty) empty.hidden = true;

    list.replaceChildren.apply(
      list,
      orders.map(function (order) {
        const card = document.createElement("article");
        card.className = "order-card";

        const top = document.createElement("div");
        top.className = "order-card-top";

        const reference = document.createElement("h3");
        reference.textContent = order.reference;

        const total = document.createElement("strong");
        total.textContent = formatPrice(order.totalCents);

        top.append(reference, total);

        const meta = document.createElement("p");
        meta.className = "order-card-meta";

        const date = document.createElement("span");
        date.textContent = formatDate(order.createdAt);

        const count = document.createElement("span");
        const itemCount = order.items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        count.textContent = itemCount + (itemCount > 1 ? " articles" : " article");

        const status = document.createElement("span");
        status.className = "status-pill status-pill--demo";
        status.textContent = order.statusLabel || "Commande simulée";

        meta.append(date, count, status);

        const actions = document.createElement("div");
        actions.className = "order-card-actions";
        const link = document.createElement("a");
        link.href = "confirmation.html?ref=" + encodeURIComponent(order.reference);
        link.textContent = "Voir la confirmation →";
        actions.appendChild(link);

        card.append(top, meta, actions);
        return card;
      })
    );
  }

  const logoutButton = page.querySelector("[data-logout]");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      logout();
    });
  }
}

/* ---------------------------------------------------------
   13. INSCRIPTION
   --------------------------------------------------------- */
function initSignupPage() {
  const form = document.querySelector("[data-signup-form]");
  if (!form) return;

  if (getSession()) {
    window.location.replace("compte.html");
    return;
  }

  const errorBox = document.querySelector("[data-signup-error]");
  const successBox = document.querySelector("[data-signup-success]");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }

    const firstName = document.getElementById("signup-prenom");
    const lastName = document.getElementById("signup-nom");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");
    const confirm = document.getElementById("signup-confirm");
    const conditions = document.getElementById("signup-conditions");

    const values = {
      firstName: firstName ? firstName.value.trim() : "",
      lastName: lastName ? lastName.value.trim() : "",
      email: email ? email.value.trim() : "",
      password: password ? password.value : "",
      confirm: confirm ? confirm.value : "",
      conditions: conditions ? conditions.checked : false
    };

    let valid = true;

    function check(id, condition, message) {
      if (!condition) {
        setFieldError(id, message);
        valid = false;
      } else {
        setFieldError(id, "");
      }
    }

    check("signup-prenom", values.firstName.length >= 2, "Indiquez votre prénom.");
    check("signup-nom", values.lastName.length >= 2, "Indiquez votre nom.");
    check("signup-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email), "Indiquez une adresse e-mail valide.");
    check("signup-password", values.password.length >= 8, "Le mot de passe doit contenir au moins 8 caractères.");
    check("signup-confirm", values.confirm === values.password, "Les deux mots de passe ne correspondent pas.");

    if (!values.conditions) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = "Vous devez accepter les conditions de la démonstration.";
      }
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector(".input-error");
      if (firstError) firstError.focus();
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit ? submit.textContent : "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Création du compte…";
    }

    try {
      await registerUser(values);

      if (successBox) {
        successBox.hidden = false;
        successBox.textContent = "Compte créé. Redirection vers la vérification…";
      }

      window.setTimeout(function () {
        window.location.href = "verification.html?email=" + encodeURIComponent(values.email);
      }, 900);
    } catch (error) {
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = error.message || "Le compte n'a pas pu être créé.";
      }
    }
  });
}

/* ---------------------------------------------------------
   14. CONNEXION
   --------------------------------------------------------- */
function initLoginPage() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  const next = safeNext(getParam("next"), "compte.html");

  if (getSession()) {
    window.location.replace(next);
    return;
  }

  const infoBox = document.querySelector("[data-login-info]");
  if (getParam("verified") === "1" && infoBox) {
    infoBox.hidden = false;
    infoBox.textContent = "Votre compte est vérifié. Vous pouvez maintenant vous connecter.";
  }

  const forgot = document.querySelector("[data-forgot-password]");
  if (forgot) {
    forgot.addEventListener("click", function (event) {
      event.preventDefault();
      if (infoBox) {
        infoBox.hidden = false;
        infoBox.textContent = "La récupération de mot de passe n'est pas disponible dans ce prototype local.";
      }
    });
  }

  const errorBox = document.querySelector("[data-login-error]");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    const values = {
      email: email ? email.value.trim() : "",
      password: password ? password.value : ""
    };

    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setFieldError("login-email", "Indiquez une adresse e-mail valide.");
      valid = false;
    } else {
      setFieldError("login-email", "");
    }

    if (!values.password) {
      setFieldError("login-password", "Indiquez votre mot de passe.");
      valid = false;
    } else {
      setFieldError("login-password", "");
    }

    if (!valid) return;

    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit ? submit.textContent : "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Connexion…";
    }

    try {
      await loginUser(values.email, values.password);
      window.location.href = next;
    } catch (error) {
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = error.message || "La connexion a échoué.";
      }
    }
  });
}

/* ---------------------------------------------------------
   15. VÉRIFICATION SIMULÉE
   --------------------------------------------------------- */
function initVerificationPage() {
  const form = document.querySelector("[data-verify-form]");
  if (!form) return;

  if (getSession()) {
    window.location.replace("compte.html");
    return;
  }

  const pending = readJSON(STORAGE_KEYS.pending, null);
  const email = (getParam("email") || (pending && pending.email) || "").trim().toLowerCase();
  const emailLabel = document.querySelector("[data-verify-email]");
  const noEmail = document.querySelector("[data-verify-no-email]");
  const errorBox = document.querySelector("[data-verify-error]");
  const successBox = document.querySelector("[data-verify-success]");

  if (!email) {
    form.hidden = true;
    if (noEmail) noEmail.hidden = false;
    return;
  }

  if (emailLabel) emailLabel.textContent = email;

  const resend = document.querySelector("[data-resend-code]");
  if (resend) {
    resend.addEventListener("click", function (event) {
      event.preventDefault();
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.className = "alert alert-info";
        errorBox.textContent = "Le code de démonstration est toujours 123456. Aucun e-mail réel n'est envoyé.";
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (errorBox) {
      errorBox.hidden = true;
      errorBox.className = "alert alert-error";
      errorBox.textContent = "";
    }

    const code = document.getElementById("verify-code");
    const value = code ? code.value.trim() : "";

    if (!/^\d{6}$/.test(value)) {
      setFieldError("verify-code", "Saisissez les 6 chiffres du code.");
      return;
    }

    setFieldError("verify-code", "");

    try {
      verifyUser(email, value);
      if (successBox) {
        successBox.hidden = false;
        successBox.textContent = "Compte vérifié ! Redirection vers la connexion…";
      }
      window.setTimeout(function () {
        window.location.href = "connexion.html?verified=1&email=" + encodeURIComponent(email);
      }, 1000);
    } catch (error) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.className = "alert alert-error";
        errorBox.textContent = error.message || "Le code est incorrect.";
      }
    }
  });
}

/* ---------------------------------------------------------
   16. FORMULAIRE DE CONTACT (WhatsApp)
   --------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const firstName = document.getElementById("prenom");
  const phone = document.getElementById("telephone");
  const subject = document.getElementById("sujet");
  const message = document.getElementById("message");
  const confirmation = document.getElementById("confirmation");

  function showError(field, text) {
    const zone = document.getElementById("erreur-" + field.id);
    if (!zone) return;

    if (text) {
      field.classList.add("input-error");
      field.setAttribute("aria-invalid", "true");
      zone.textContent = text;
    } else {
      field.classList.remove("input-error");
      field.removeAttribute("aria-invalid");
      zone.textContent = "";
    }
  }

  [firstName, phone, message].forEach(function (field) {
    if (!field) return;
    field.addEventListener("input", function () {
      showError(field, "");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    [firstName, phone, message].forEach(function (field) {
      if (field) showError(field, "");
    });

    let valid = true;

    if (!firstName || firstName.value.trim().length < 2) {
      if (firstName) showError(firstName, "Écrivez au moins 2 caractères.");
      valid = false;
    }

    const phoneValue = phone ? phone.value.trim() : "";
    if (phoneValue !== "" && phoneValue.replace(/[^\d+]/g, "").length < 8) {
      if (phone) showError(phone, "Vérifiez le numéro de téléphone.");
      valid = false;
    }

    if (!message || message.value.trim().length < 5) {
      if (message) showError(message, "Écrivez un petit message (5 caractères minimum).");
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector(".input-error");
      if (firstInvalid) firstInvalid.focus();
      if (confirmation) confirmation.hidden = true;
      return;
    }

    const text =
      "Bonjour Chez Wieme,\n\n" +
      "Je m'appelle " + firstName.value.trim() + ".\n" +
      "Téléphone : " + (phoneValue || "non précisé") + "\n" +
      "Demande : " + (subject ? subject.value : "Une question") + "\n\n" +
      message.value.trim() + "\n\n" +
      "Merci !";

    const link = lienWhatsApp(text);

    if (confirmation) {
      const name = confirmation.querySelector("[data-prenom]");
      const manual = confirmation.querySelector("a");
      if (name) name.textContent = firstName.value.trim();
      if (manual) manual.href = link;
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    window.open(link, "_blank", "noopener");
    form.reset();
  });
}

/* ---------------------------------------------------------
   17. EN-TÊTE, LIENS ET MENU MOBILE
   --------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");

  if (!header || !toggle) return;

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  toggle.addEventListener("click", function () {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });

  document.querySelectorAll(".site-nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && header.classList.contains("nav-open")) {
      closeMenu();
    }
  });
}

function initWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
    const message = link.dataset.whatsapp || MESSAGE_PAR_DEFAUT;
    link.href = lienWhatsApp(message);
  });
}

function initSocialLinks() {
  document.querySelectorAll('[data-social="instagram"]').forEach(function (link) {
    if (CONTACT.instagram) link.href = CONTACT.instagram;
  });
  document.querySelectorAll('[data-social="facebook"]').forEach(function (link) {
    if (CONTACT.facebook) link.href = CONTACT.facebook;
  });
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
}

/* Ajout au panier depuis n'importe quelle carte produit. */
document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  event.preventDefault();
  addToCart(button.dataset.addToCart, 1);
});

/* ---------------------------------------------------------
   18. DÉMARRAGE
   --------------------------------------------------------- */
function init() {
  initHeader();
  initWhatsAppLinks();
  initSocialLinks();
  initYear();
  updateCartCount();
  updateAccountLink();

  renderCatalog();
  initFilters();
  initDetailPage();
  initCartPage();
  initCheckoutPage();
  initConfirmationPage();
  initAccountPage();
  initSignupPage();
  initLoginPage();
  initVerificationPage();
  initContactForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
