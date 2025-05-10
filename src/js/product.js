import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

// Use utility functions to read/write cart
function addProductToCart(product) {
  // Get existing cart or start with an empty array
  const cart = getLocalStorage("so-cart") || [];

  // Add the new product to the cart
  cart.push(product);

  // Save updated cart
  setLocalStorage("so-cart", cart);
}

// Event handler for the Add to Cart button
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// Attach event listener
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
