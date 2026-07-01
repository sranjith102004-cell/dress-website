const whatsappNumber = "918870939099";
const currencyPrefix = "Rs";
const googleSheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNRbIipVaaaIjRxbbp6uJ91rIlap_lScEmxMtsgdGAkz0OpFOVeG94XQ5Ul2aa8O6ctYxHyc5tM22U/pub?gid=0&single=true&output=csv";

const sampleDresses = [
  {
    code: "D001",
    name: "Alya Everyday Kurti",
    category: "kurti",
    color: "Teal",
    price: 89,
    sizes: ["S", "M", "L", "XL"],
    bg: "linear-gradient(135deg, #e7f2ef, #b8d8d4)",
    dress: "#0f766e",
    stockCount: 5,
    sizeStock: { S: 1, M: 2, L: 1, XL: 1 },
  },
  {
    code: "D002",
    name: "Rosa Soft Gown",
    category: "gown",
    color: "Coral",
    price: 129,
    sizes: ["M", "L", "XL"],
    bg: "linear-gradient(135deg, #fff1ed, #f1b7aa)",
    dress: "#d85a43",
    stockCount: 2,
    sizeStock: { M: 1, L: 1, XL: 0 },
  },
  {
    code: "D003",
    name: "Nila Casual Dress",
    category: "casual",
    color: "Navy",
    price: 79,
    sizes: ["S", "M", "L"],
    bg: "linear-gradient(135deg, #eef3f8, #aeb9c7)",
    dress: "#293241",
    stockCount: 4,
    sizeStock: { S: 2, M: 1, L: 1 },
  },
  {
    code: "D004",
    name: "Meera Party Set",
    category: "party",
    color: "Olive",
    price: 149,
    sizes: ["S", "M", "L", "XL"],
    bg: "linear-gradient(135deg, #f3f6eb, #bccb9b)",
    dress: "#8aa66a",
    stockCount: 1,
    sizeStock: { S: 0, M: 1, L: 0, XL: 0 },
  },
  {
    code: "D005",
    name: "Luna Printed Kurti",
    category: "kurti",
    color: "Ivory",
    price: 99,
    sizes: ["M", "L", "XL", "XXL"],
    bg: "linear-gradient(135deg, #fbf7ec, #dfd3b8)",
    dress: "#c8aa6e",
    stockCount: 3,
    sizeStock: { M: 1, L: 1, XL: 1, XXL: 0 },
  },
  {
    code: "D006",
    name: "Zara Flow Dress",
    category: "casual",
    color: "Plum",
    price: 109,
    sizes: ["S", "M", "L"],
    bg: "linear-gradient(135deg, #f4edf3, #c7a9c1)",
    dress: "#7b416d",
    stockCount: 6,
    sizeStock: { S: 2, M: 2, L: 2 },
  },
];

let dresses = [...sampleDresses];
const cart = [];
const productQuantities = {};
const selectedSizes = {};
const shopView = document.querySelector("#shopView");
const cartView = document.querySelector("#cartView");
const catalogGrid = document.querySelector("#catalogGrid");
const filters = document.querySelector("#filters");
const loadMorePanel = document.querySelector("#loadMorePanel");
const viewedCountText = document.querySelector("#viewedCountText");
const loadProgressBar = document.querySelector("#loadProgressBar");
const loadMoreButton = document.querySelector("#loadMoreButton");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const whatsappButton = document.querySelector("#whatsappButton");
const cartNavButton = document.querySelector("#cartNavButton");
const cartCount = document.querySelector("#cartCount");
const backToShopButton = document.querySelector("#backToShopButton");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerAddress = document.querySelector("#customerAddress");
const searchInput = document.querySelector("#searchInput");
const imageModal = document.querySelector("#imageModal");
const modalImage = document.querySelector("#modalImage");
const modalCloseButton = document.querySelector("#modalCloseButton");

let activeFilter = "all";
let visibleProductLimit = 12;
const productsPerLoad = 12;

function formatPrice(amount) {
  return `${currencyPrefix} ${amount}`;
}

function getProductSizes(dress) {
  return dress.sizes;
}

function getProductQuantity(code) {
  return productQuantities[code] || 1;
}

function getSelectedStockLimit(dress) {
  const selectedSize = selectedSizes[dress.code] || "";
  if (selectedSize && dress.sizeStock && Object.hasOwn(dress.sizeStock, selectedSize)) {
    return dress.sizeStock[selectedSize];
  }

  return dress.stockCount ?? null;
}

function updateProductQuantity(code, change) {
  const dress = dresses.find((item) => item.code === code);
  if (!dress) return;

  const maxQuantity = getSelectedStockLimit(dress) ?? Infinity;
  if (maxQuantity === 0) return;

  productQuantities[code] = Math.min(maxQuantity, Math.max(1, getProductQuantity(code) + change));
  renderCatalog();
}

function getStockCount(product) {
  const rawStockCount =
    product.stockcount || product["stock count"] || product.quantity || product.qty || product.available || "";
  const stockCount = Number(String(rawStockCount).replace(/[^\d]/g, ""));
  if (String(rawStockCount).trim() === "") return null;
  return Number.isFinite(stockCount) && stockCount >= 0 ? stockCount : null;
}

function getSizeStock(product) {
  const rawSizeStock = product.sizestock || product["size stock"] || product.sizestocks || product["size stocks"] || "";
  if (!rawSizeStock.trim()) return {};

  return rawSizeStock.split(",").reduce((stocks, entry) => {
    const [rawSize, rawCount] = entry.split(":");
    const size = rawSize?.trim();
    const count = Number(String(rawCount || "").replace(/[^\d]/g, ""));

    if (size && Number.isFinite(count)) stocks[size] = count;
    return stocks;
  }, {});
}

function getTotalSizeStock(sizeStock) {
  const counts = Object.values(sizeStock || {});
  return counts.length ? counts.reduce((sum, count) => sum + count, 0) : null;
}

function getStockLabel(dress) {
  const selectedSize = selectedSizes[dress.code];

  if (selectedSize && dress.sizeStock && Object.hasOwn(dress.sizeStock, selectedSize)) {
    return `${dress.sizeStock[selectedSize]} in stock for ${selectedSize}`;
  }

  if (dress.stockCount !== null && dress.stockCount !== undefined) return `${dress.stockCount} in stock`;

  return "";
}

function formatCategory(category) {
  return category
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function showShopView(targetId = "catalog") {
  shopView.classList.remove("hidden-view");
  cartView.classList.add("hidden-view");
  document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCartView() {
  shopView.classList.add("hidden-view");
  cartView.classList.remove("hidden-view");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCartCount() {
  cartCount.textContent = cart.length;
}

function renderFilters() {
  const categories = [...new Set(dresses.map((dress) => dress.category).filter(Boolean))].sort();
  if (activeFilter !== "all" && !categories.includes(activeFilter)) activeFilter = "all";

  filters.innerHTML = [
    `<button class="filter-button ${activeFilter === "all" ? "active" : ""}" type="button" data-filter="all">All</button>`,
    ...categories.map(
      (category) =>
        `<button class="filter-button ${activeFilter === category ? "active" : ""}" type="button" data-filter="${category}">${formatCategory(
          category,
        )}</button>`,
    ),
  ].join("");
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function sheetRowsToDresses(csvText) {
  const rows = parseCsv(csvText);
  const headers = rows.shift().map((header) => header.trim().toLowerCase());

  return rows
    .map((row, index) => {
      const product = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] || ""]));
      const code = product.code || `D${String(index + 1).padStart(3, "0")}`;
      const price = Number(String(product.price || "0").replace(/[^\d.]/g, ""));
      const stock = (product.stock || product.stocks || "available").trim().toLowerCase();
      const sizeStock = getSizeStock(product);
      const stockCount = getStockCount(product) ?? getTotalSizeStock(sizeStock);

      return {
        code,
        name: product.name || product["dress name"] || "Dress",
        category: (product.category || "casual").toLowerCase(),
        color: product.color || "Color",
        price,
        sizes: (product.sizes || product.size || "")
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
        stock,
        stockCount,
        sizeStock,
        photo: product.photo || product.image || "",
        bg: product.bg || sampleDresses[index % sampleDresses.length].bg,
        dress: product.dress || sampleDresses[index % sampleDresses.length].dress,
      };
    })
    .filter((dress) => dress.name && dress.price > 0 && dress.stock !== "hide");
}

async function loadDressesFromSheet() {
  if (!googleSheetCsvUrl) {
    renderCatalog();
    renderCart();
    return;
  }

  try {
    catalogGrid.innerHTML = '<p class="muted">Loading latest dresses...</p>';
    const sheetUrl = `${googleSheetCsvUrl}${googleSheetCsvUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const response = await fetch(sheetUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Sheet could not be loaded");

    const sheetDresses = sheetRowsToDresses(await response.text());
    if (sheetDresses.length) dresses = sheetDresses;
  } catch (error) {
    catalogGrid.innerHTML =
      '<p class="muted">Could not load Google Sheet. Showing sample dresses for now.</p>';
  }

  renderCatalog();
  renderCart();
}

function renderCatalog() {
  renderFilters();
  const query = searchInput.value.trim().toLowerCase();
  const visibleDresses = dresses.filter((dress) => {
    const matchesFilter = activeFilter === "all" || dress.category === activeFilter;
    const searchable = `${dress.code} ${dress.name} ${dress.color} ${dress.category}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });
  const visibleProductCount = Math.min(visibleProductLimit, visibleDresses.length);
  const listedDresses = visibleDresses.slice(0, visibleProductCount);

  catalogGrid.innerHTML = listedDresses
    .map(
      (dress) => `
        <article class="product-card">
          <button class="product-image${dress.photo ? " has-photo" : ""}" type="button" data-preview-code="${
            dress.code
          }" style="--dress-bg: ${dress.bg}; --dress-color: ${dress.dress}">
            ${
              dress.photo
                ? `<img class="dress-photo" src="${dress.photo}" alt="${dress.name}" loading="lazy" />`
                : ""
            }
            <span class="code-pill">${dress.code}</span>
            ${dress.stock === "sold out" || dress.stockCount === 0 ? '<span class="stock-pill">Sold out</span>' : ""}
          </button>
          <div class="product-info">
            <div class="product-meta">
              <div>
                <h3>${dress.name}</h3>
                <p>${dress.color} - ${dress.category}</p>
              </div>
              <div class="price-stack">
                <span class="price">${formatPrice(dress.price)}</span>
                <div class="product-quantity" aria-label="Quantity">
                  <button type="button" data-product-quantity="${dress.code}" data-change="-1">-</button>
                  <strong>${getProductQuantity(dress.code)}</strong>
                  <button type="button" data-product-quantity="${dress.code}" data-change="1">+</button>
                </div>
              </div>
            </div>
            ${getStockLabel(dress) ? `<p class="stock-count">${getStockLabel(dress)}</p>` : ""}
            ${
              getProductSizes(dress).length
                ? `
                  <div class="sizes" aria-label="Available sizes">
                    ${getProductSizes(dress)
                      .map(
                        (size) => `
                          <button
                            class="size-option${selectedSizes[dress.code] === size ? " selected" : ""}"
                            type="button"
                            data-size-code="${dress.code}"
                            data-size="${size}"
                            ${selectedSizes[dress.code] === size ? 'aria-pressed="true"' : 'aria-pressed="false"'}
                            ${selectedSizes[dress.code] === size ? "data-selected=\"true\"" : ""}
                            ${
                              dress.stock === "sold out" ||
                              (dress.sizeStock && Object.hasOwn(dress.sizeStock, size) && dress.sizeStock[size] === 0) ||
                              dress.stockCount === 0
                                ? "disabled"
                                : ""
                            }
                          >
                            ${size}
                          </button>
                        `,
                      )
                      .join("")}
                  </div>
                  <p class="size-warning" data-size-warning="${dress.code}">Please select a size first.</p>
                `
                : ""
            }
            <button class="add-button" type="button" data-code="${dress.code}" ${
              dress.stock === "sold out" || dress.stockCount === 0 ? "disabled" : ""
            }>
              ${dress.stock === "sold out" || dress.stockCount === 0 ? "Sold Out" : "Add to Order"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  if (!visibleDresses.length) {
    catalogGrid.innerHTML = '<p class="muted">No dresses match your search.</p>';
  }

  viewedCountText.textContent = `You've viewed ${visibleProductCount} of ${visibleDresses.length} products`;
  loadProgressBar.style.width = visibleDresses.length ? `${(visibleProductCount / visibleDresses.length) * 100}%` : "0%";
  loadMorePanel.classList.toggle("hidden-view", visibleDresses.length <= productsPerLoad);
  loadMoreButton.classList.toggle("hidden-view", visibleProductCount >= visibleDresses.length);
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">No dresses added yet.</p>';
    cartTotal.textContent = `${currencyPrefix} 0`;
    whatsappButton.classList.add("disabled");
    whatsappButton.setAttribute("aria-disabled", "true");
    whatsappButton.href = "#";
    updateCartCount();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-line">
          <div>
            <strong>${item.code}</strong> ${item.name}
            <br />
            <span>${formatPrice(item.price)}${item.selectedSize ? ` - Size ${item.selectedSize}` : ""}</span>
          </div>
          <div class="quantity-control" aria-label="Quantity">
            <button type="button" data-quantity="${index}" data-change="-1">-</button>
            <strong>${item.quantity}</strong>
            <button type="button" data-quantity="${index}" data-change="1">+</button>
          </div>
          <button type="button" data-remove="${index}">Remove</button>
        </div>
      `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);

  const lines = cart.map(
    (item) =>
      `- ${item.code} ${item.name}${item.selectedSize ? `, Size ${item.selectedSize}` : ""}, Qty ${
        item.quantity
      } (${formatPrice(
        item.price * item.quantity,
      )})`,
  );
  const name = customerName.value.trim() || "Not provided";
  const phone = customerPhone.value.trim() || "Not provided";
  const address = customerAddress.value.trim() || "Not provided";
  const message = [
    "Hi, I want to order these dresses:",
    ...lines,
    `Total: ${formatPrice(total)}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Delivery address: ${address}`,
  ].join("\n");

  whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  whatsappButton.classList.remove("disabled");
  whatsappButton.setAttribute("aria-disabled", "false");
  updateCartCount();
}

catalogGrid.addEventListener("click", (event) => {
  const previewButton = event.target.closest("[data-preview-code]");
  if (previewButton) {
    const dress = dresses.find((item) => item.code === previewButton.dataset.previewCode);
    if (!dress) return;

    modalImage.src = dress.photo || "assets/boutique-dresses.png";
    modalImage.alt = dress.name;
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
    return;
  }

  const productQuantityButton = event.target.closest("[data-product-quantity]");
  if (productQuantityButton) {
    updateProductQuantity(productQuantityButton.dataset.productQuantity, Number(productQuantityButton.dataset.change));
    return;
  }

  const sizeButton = event.target.closest("[data-size]");
  if (sizeButton) {
    const card = sizeButton.closest(".product-card");
    const wasSelected = sizeButton.classList.contains("selected");

    card.querySelectorAll("[data-size]").forEach((button) => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });

    if (!wasSelected) {
      sizeButton.classList.add("selected");
      sizeButton.setAttribute("aria-pressed", "true");
      selectedSizes[sizeButton.dataset.sizeCode] = sizeButton.dataset.size;
    } else {
      delete selectedSizes[sizeButton.dataset.sizeCode];
    }

    card.querySelector(".size-warning")?.classList.remove("visible");
    return;
  }

  const button = event.target.closest("[data-code]");
  if (!button) return;

  const dress = dresses.find((item) => item.code === button.dataset.code);
  if (!dress || dress.stock === "sold out" || dress.stockCount === 0) return;

  const card = button.closest(".product-card");
  const productSizes = getProductSizes(dress);
  const selectedSize = card.querySelector("[data-size].selected")?.dataset.size || "";
  if (productSizes.length && !selectedSize) {
    card.querySelector(".size-warning")?.classList.add("visible");
    return;
  }

  const existingItem = cart.find((item) => item.code === dress.code && item.selectedSize === selectedSize);
  const quantity = getProductQuantity(dress.code);
  const selectedStockLimit = getSelectedStockLimit(dress);

  if (existingItem) {
    existingItem.quantity = selectedStockLimit !== null && selectedStockLimit !== undefined
      ? Math.min(selectedStockLimit, existingItem.quantity + quantity)
      : existingItem.quantity + quantity;
  } else {
    cart.push({ ...dress, selectedSize, quantity, stockLimit: selectedStockLimit });
  }

  productQuantities[dress.code] = 1;
  delete selectedSizes[dress.code];
  renderCatalog();
  renderCart();
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const index = Number(quantityButton.dataset.quantity);
    const change = Number(quantityButton.dataset.change);
    const maxQuantity = cart[index].stockLimit ?? cart[index].stockCount ?? Infinity;
    cart[index].quantity = Math.min(maxQuantity, cart[index].quantity + change);

    if (cart[index].quantity < 1) {
      cart.splice(index, 1);
    }

    renderCart();
    return;
  }

  const button = event.target.closest("[data-remove]");
  if (!button) return;

  cart.splice(Number(button.dataset.remove), 1);
  renderCart();
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;
  visibleProductLimit = productsPerLoad;
  renderCatalog();
});

searchInput.addEventListener("input", () => {
  visibleProductLimit = productsPerLoad;
  renderCatalog();
});
loadMoreButton.addEventListener("click", () => {
  visibleProductLimit += productsPerLoad;
  renderCatalog();
});
customerName.addEventListener("input", renderCart);
customerPhone.addEventListener("input", renderCart);
customerAddress.addEventListener("input", renderCart);
cartNavButton.addEventListener("click", showCartView);
backToShopButton.addEventListener("click", () => showShopView("catalog"));
document.querySelectorAll('a[href="#catalog"], a[href="#contact"], a[href="#home"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href").slice(1);
    if (cartView.classList.contains("hidden-view")) return;

    event.preventDefault();
    showShopView(targetId);
  });
});
modalCloseButton.addEventListener("click", () => {
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
  modalImage.removeAttribute("src");
});
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) modalCloseButton.click();
});

loadDressesFromSheet();
