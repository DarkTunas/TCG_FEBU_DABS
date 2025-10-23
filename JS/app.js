// ====================== Menú y navegación ======================
let menu = document.querySelector("#icono-menu");
let navegacion = document.querySelector(".navegacion");

menu.addEventListener("click", function() {
    navegacion.classList.toggle("active");
});

window.onscroll = () => {
    navegacion.classList.remove("active");
};

// ====================== Carrito ======================
const addToCartButtons = document.querySelectorAll('.product-grid__btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTotalElement = document.getElementById('cart-total');
const closeModalButton = document.querySelector('.jsModalClose');
const cartLink = document.getElementById('cart-link');

let carrito = [];

// Abrir y cerrar modal
function openModal() {
    document.getElementById('jsModalCarrito').classList.add('active');
}
function closeModal() {
    document.getElementById('jsModalCarrito').classList.remove('active');
}

// Agregar producto
function addToCart(product) {
    const existing = carrito.find(item => item.name === product.name);
    if(existing){
        existing.quantity++;
    } else {
        carrito.push({...product, quantity:1});
    }
    updateCartUI();
    openModal();
}

// Actualizar UI del carrito
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    carrito.forEach(item => {
        subtotal += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.classList.add('modal__item');
        cartItem.innerHTML = `
            <div class="modal__thumb">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="modal__text-product">
                <p>${item.name} x${item.quantity}</p>
                <p><strong>$${(item.price*item.quantity).toFixed(2)}</strong></p>
                <button class="remove-btn" data-name="${item.name}">Eliminar</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeFromCart);
    });
}

// Eliminar producto
function removeFromCart(e){
    const name = e.target.getAttribute('data-name');
    carrito = carrito.filter(item => item.name !== name);
    updateCartUI();
}

// Botones "Agregar al carrito"
addToCartButtons.forEach(button => {
    button.addEventListener('click', e => {
        const productEl = e.target.closest('.product-grid__item');
        const product = {
            name: productEl.dataset.name,
            price: parseFloat(productEl.dataset.price),
            image: productEl.dataset.image
        };
        addToCart(product);
    });
});

// Abrir y cerrar modal carrito
cartLink.addEventListener('click', e => {
    e.preventDefault();
    openModal();
});
closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', e => {
    const modal = document.getElementById('jsModalCarrito');
    if(modal.classList.contains('active') && e.target === modal){
        closeModal();
    }
});

// ====================== PDF y QR ======================
function generarFacturaPDF(carrito){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Factura FEBU_DABS", 105, 20, null, null, "center");

    const nombre = prompt("Nombre del cliente:");
    const rfc = prompt("RFC:");
    const direccion = prompt("Dirección:");

    doc.setFontSize(12);
    doc.text(`Cliente: ${nombre}`, 20, 40);
    doc.text(`RFC: ${rfc}`, 20, 50);
    doc.text(`Dirección: ${direccion}`, 20, 60);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text("Productos:", 20, 85);

    let y = 95;
    let total = 0;
    carrito.forEach(item => {
        doc.text(`${item.name} x${item.quantity} - $${(item.price*item.quantity).toFixed(2)}`, 20, y);
        total += item.price * item.quantity;
        y += 10;
    });

    doc.text(`Total: $${total.toFixed(2)}`, 20, y+5);

    const qr = new QRious({
        value: `Factura FEBU_DABS\nCliente: ${nombre}\nTotal: $${total.toFixed(2)}`,
        size: 100
    });

    const qrDataURL = qr.toDataURL();
    doc.addImage(qrDataURL, 'PNG', 150, 30, 50, 50);

    doc.save(`Factura_${nombre}.pdf`);
}

// ====================== Comprar Ahora ======================
document.getElementById('btnPagar').addEventListener('click', () => {
    if(carrito.length === 0){
        alert('El carrito está vacío');
        return;
    }

    localStorage.setItem("carritoProductos", JSON.stringify(carrito));
    const deseaFactura = confirm("Pago exitoso. ¿Desea facturar?");
    if(deseaFactura){
        generarFacturaPDF(carrito);
    } else {
        alert("Gracias por su compra!");
    }
    carrito = [];
    updateCartUI();
});

// ====================== Botón "Ver más" ======================
document.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll('.product-grid__item');
    const loadMoreButton = document.getElementById('loadMore');
    const productsPerPage = 4;
    let currentIndex = 8;

    products.forEach((product, index) => {
        if(index >= currentIndex) product.style.display = 'none';
    });

    loadMoreButton.addEventListener('click', () => {
        let newCount = currentIndex + productsPerPage;
        for(let i=currentIndex; i<newCount && i<products.length; i++){
            products[i].style.display = 'block';
        }
        currentIndex = newCount;
        if(currentIndex >= products.length) loadMoreButton.style.display = 'none';
    });
});

// ====================== Contador de visitas ======================
let visitCount = localStorage.getItem('visitCount') || 0;
visitCount++;
localStorage.setItem('visitCount', visitCount);
document.getElementById('visitCounter').textContent = visitCount;

// ====================== Chat IA ======================
const chatBox = document.getElementById('chat-box');
const chatWidget = document.getElementById('chat-widget');
const chatContent = document.getElementById('chat-content');
const toggleButton = document.getElementById('toggle-button');
let isChatOpen = true;

function toggleChat(){
    if(isChatOpen){
        chatContent.style.display = 'none';
        chatWidget.style.height = '40px';
        toggleButton.textContent = '+';
    } else {
        chatContent.style.display = 'flex';
        chatWidget.style.height = '500px';
        toggleButton.textContent = '-';
    }
    isChatOpen = !isChatOpen;
}

function addPredeterminedQuestion(question){
    addMessage(question, 'user-message');
    let response;
    switch(question){
        case '¿Cuál es tu horario de atención?':
            response = 'Nuestro horario de atención es de 9:00 AM a 6:00 PM, de lunes a viernes.';
            break;
        case '¿Cuáles son los métodos de pago aceptados?':
            response = 'Aceptamos tarjetas de crédito, débito y pagos por PayPal.';
            break;
        case '¿Ofrecen envíos internacionales?':
            response = 'Sí, hacemos envíos internacionales a varios países.';
            break;
        default:
            response = 'Lo siento, no tengo una respuesta para eso.';
    }
    addMessage(response, 'bot-message');
}

function sendMessage(){
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if(message){
        addMessage(message, 'user-message');
        generateAIResponse(message);
        userInput.value = '';
    }
}

function addMessage(text, className){
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${className}`;
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function generateAIResponse(message){
    let response = "Lo siento, no tengo una respuesta específica para esa pregunta, pero puedo ayudarte con preguntas comunes.";
    if(message.toLowerCase().includes("precio") || message.toLowerCase().includes("costo")){
        response = "Los precios dependen del producto. Por favor, contáctanos para detalles específicos.";
    }
    setTimeout(()=>addMessage(response, 'bot-message'), 1000);
}

// ====================== Contacto ======================
function abrirModal() {
    document.getElementById("miModal").style.display = "block";
}
function cerrarModal() {
    document.getElementById("miModal").style.display = "none";
}
window.onclick = function(event) {
    const modal = document.getElementById("miModal");
    if(event.target === modal){
        cerrarModal();
    }
};
//
function addToCart(product) {
    const existingProduct = carrito.find(item => item.name === product.name);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        carrito.push({ ...product, quantity: 1 });
    }

    // Guardar carrito en localStorage inmediatamente
    localStorage.setItem("carritoProductos", JSON.stringify(carrito));

    updateCartUI();
    openModal();
}