async function loadProducts() {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error("No s'ha pogut carregar el fitxer JSON.");
    }

    const products = await response.json();

    const container = document.getElementById("products");

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="content">
          <h2>${product.name}</h2>
          <p><strong>Categoria:</strong> ${product.category}</p>
          <p><strong>Unitat:</strong> ${product.unit}</p>
          <span class="stock">Stock: ${product.stock}</span>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    document.getElementById("products").innerHTML =
      `<p class="error">${error.message}</p>`;
    console.error(error);
  }
}

loadProducts();