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
  },
];

let dresses = [...sampleDresses];
const cart = [];
const catalogGrid = document.querySelector("#catalogGrid");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const whatsappButton = document.querySelector("#whatsappButton");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerAddress = document.querySelector("#customerAddress");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter-button");

let activeFilter = "all";

function formatPrice(amount) {
  return `${currencyPrefix} ${amount}`;
}

function getProductSizes(dress) {
  return dress.sizes.length ? dress.sizes : ["Free Size"];
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
      const stock = (product.stock || "available").toLowerCase();

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
    const response = await fetch(googleSheetCsvUrl);
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
  const query = searchInput.value.trim().toLowerCase();
  const visibleDresses = dresses.filter((dress) => {
    const matchesFilter = activeFilter === "all" || dress.category === activeFilter;
    const searchable = `${dress.code} ${dress.name} ${dress.color} ${dress.category}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });

  catalogGrid.innerHTML = visibleDresses
    .map(
      (dress) => `
        <article class="product-card">
          <div class="product-image${dress.photo ? " has-photo" : ""}" style="--dress-bg: ${dress.bg}; --dress-color: ${dress.dress}">
            ${
              dress.photo
                ? `<img class="dress-photo" src="${dress.photo}" alt="${dress.name}" loading="lazy" />`
                : ""
            }
            <span class="code-pill">${dress.code}</span>
            ${dress.stock === "sold out" ? '<span class="stock-pill">Sold out</span>' : ""}
          </div>
          <div class="product-info">
            <div class="product-meta">
              <div>
                <h3>${dress.name}</h3>
                <p>${dress.color} - ${dress.category}</p>
              </div>
              <span class="price">${formatPrice(dress.price)}</span>
            </div>
            <div class="sizes" aria-label="Available sizes">
              ${getProductSizes(dress)
                .map(
                  (size) => `
                    <button
                      class="size-option"
                      type="button"
                      data-size-code="${dress.code}"
                      data-size="${size}"
                      ${dress.stock === "sold out" ? "disabled" : ""}
                    >
                      ${size}
                    </button>
                  `,
                )
                .join("")}
            </div>
            <p class="size-warning" data-size-warning="${dress.code}">Please select a size first.</p>
            <button class="add-button" type="button" data-code="${dress.code}" ${
              dress.stock === "sold out" ? "disabled" : ""
            }>
              ${dress.stock === "sold out" ? "Sold Out" : "Add to Order"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  if (!visibleDresses.length) {
    catalogGrid.innerHTML = '<p class="muted">No dresses match your search.</p>';
  }
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">No dresses added yet.</p>';
    cartTotal.textContent = `${currencyPrefix} 0`;
    whatsappButton.classList.add("disabled");
    whatsappButton.setAttribute("aria-disabled", "true");
    whatsappButton.href = "#";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-line">
          <div>
            <strong>${item.code}</strong> ${item.name}
            <br />
            <span>${formatPrice(item.price)} - Size ${item.selectedSize}</span>
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
      `- ${item.code} ${item.name}, Size ${item.selectedSize}, Qty ${item.quantity} (${formatPrice(
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
}

catalogGrid.addEventListener("click", (event) => {
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
    }

    card.querySelector(".size-warning")?.classList.remove("visible");
    return;
  }

  const button = event.target.closest("[data-code]");
  if (!button) return;

  const dress = dresses.find((item) => item.code === button.dataset.code);
  if (!dress || dress.stock === "sold out") return;

  const card = button.closest(".product-card");
  const selectedSize = card.querySelector("[data-size].selected")?.dataset.size;
  if (!selectedSize) {
    card.querySelector(".size-warning")?.classList.add("visible");
    return;
  }

  const existingItem = cart.find((item) => item.code === dress.code && item.selectedSize === selectedSize);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...dress, selectedSize, quantity: 1 });
  }

  renderCart();
  document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const index = Number(quantityButton.dataset.quantity);
    const change = Number(quantityButton.dataset.change);
    cart[index].quantity += change;

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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderCatalog();
  });
});

searchInput.addEventListener("input", renderCatalog);
customerName.addEventListener("input", renderCart);
customerPhone.addEventListener("input", renderCart);
customerAddress.addEventListener("input", renderCart);

loadDressesFromSheet();
