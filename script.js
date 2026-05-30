// 🌾 FARMS
const farms = {
  "Strawberry":{name:"Connolly Farm PEI",lat:46.25,lng:-63.15},
  "Apple":{name:"Cowan Orchard PEI",lat:46.24,lng:-63.13},
  "Blueberry":{name:"Montague Farm",lat:46.17,lng:-62.65},
  "Potato":{name:"New Annan Farm",lat:46.40,lng:-63.58},
  "Carrot":{name:"Stratford Farm",lat:46.22,lng:-63.09},
  "Corn":{name:"Murray River Farm",lat:46.03,lng:-62.55},
  "Tomato":{name:"Cornwall Farm",lat:46.23,lng:-63.22}
};

const foods = Object.keys(farms);
const dishes = ["Pie","Soup","Salad","Juice","Bowl","Bake","Grill"];

let cart = [];
let map;
let farmMarkers = {};

// Generate random price between $5-$15
function price(){
  return (Math.random()*10 + 5).toFixed(2);
}

// INIT MAP
function initMap(){
  map = L.map("map").setView([46.2,-63.1],9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"© OpenStreetMap"
  }).addTo(map);

  // Show all farm pins
  for(const food in farms){
    const f = farms[food];
    const marker = L.marker([f.lat,f.lng])
      .addTo(map)
      .bindPopup(`<b>${f.name}</b><br>${food}`);
    farmMarkers[food] = marker;
  }
}

// CLICK FOOD → ZOOM + HIGHLIGHT
function goToFarm(food){
  const f = farms[food];
  if(!f) return;

  map.setView([f.lat,f.lng],13);

  // reset opacity for all markers
  for(const key in farmMarkers){
    farmMarkers[key].setOpacity(0.6);
  }

  farmMarkers[food].setOpacity(1);
  farmMarkers[food].openPopup();
}

// ADD TO CART
function addToCart(food,dish,priceValue){
  cart.push({food,dish,price:priceValue});
  renderCart();
}

function renderCart(){
  const c = document.getElementById("cart");
  const count = document.getElementById("cartCount");

  if(count) count.innerText = cart.length;

  if(!c) return;

  c.innerHTML = cart.length === 0
    ? "<p>Cart is empty</p>"
    : cart.map((i,k)=>`
      <div class="card">
        <h3>${i.food} ${i.dish}</h3>
        <p>💲 ${i.price}</p>
        <button onclick="removeItem(${k})">Remove</button>
      </div>
    `).join("");
}

// REMOVE ITEM
function removeItem(i){
  cart.splice(i,1);
  renderCart();
}

// FIND NEAREST FARM
function findNearestFarm(){
  const keys = Object.keys(farms);
  const f = farms[keys[Math.floor(Math.random()*keys.length)]];

  map.setView([f.lat,f.lng],12);

  farmMarkers[f.key]?.openPopup();
  L.marker([f.lat,f.lng])
    .addTo(map)
    .bindPopup(`Nearest: ${f.name}`)
    .openPopup();
}

// GENERATE MENU 300+ ITEMS
function generateMenu(){
  const menu = document.getElementById("menu");
  if(!menu) return;

  let html = "";
  for(let i=0;i<300;i++){
    const food = foods[Math.floor(Math.random()*foods.length)];
    const dish = dishes[Math.floor(Math.random()*dishes.length)];
    const farm = farms[food];
    const itemPrice = price();

    html += `
      <div class="card" onclick="goToFarm('${food}')">
        <h3>${food} ${dish}</h3>
        <p>${farm.name}</p>
        <p>💲 ${itemPrice}</p>
        <button onclick="event.stopPropagation();addToCart('${food}','${dish}','${itemPrice}')">
          Add to Cart
        </button>
      </div>
    `;
  }
  menu.innerHTML = html;
}

// Make functions global for inline buttons
window.addToCart = addToCart;
window.removeItem = removeItem;
window.goToFarm = goToFarm;
window.findNearestFarm = findNearestFarm;

// START APP
window.onload = () => {
  initMap();
  generateMenu();
  renderCart();
};
// 🛒 TOGGLE CART PANEL
function toggleCart(){
  const panel = document.getElementById("cartPanel");
  panel.classList.toggle("open");
}
// Your Stripe publishable key
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Trigger checkout
function checkout(){
  if(cart.length === 0){
    alert("Your cart is empty!");
    return;
  }

  // Create line items from cart
  const lineItems = cart.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.food + ' ' + item.dish },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: 1
  }));

  fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: lineItems })
  })
  .then(res => res.json())
  .then(session => {
    return stripe.redirectToCheckout({ sessionId: session.id });
  })
  .then(result => {
    if(result.error){
      alert(result.error.message);
    }
  })
  .catch(err => console.error(err));
}