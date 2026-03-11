const headerImages = {
    standard: 'images/header-standard.jpg',
    premium: 'images/header-premium.jpg',
    emergency: 'images/header-emergency.jpg'
};

let currentStep = 1;
const counters = {
    adults: 2,
    children: 0
};
let selectedRoom = null;
let selectedPayment = null;

const roomPrices = {
    standard: 25,
    premium: 35,
    emergency: 12
};

const roomNames = {
    standard: 'Viaclôžková izba (Štandard)',
    premium: 'Menšia izba (Premium)',
    emergency: 'Núdzové prespanie'
};

const galleryImages = {standard: [
{ src: 'images/rooms/standard/1.jpg', alt: 'Štandardná izba – lôžka' },
{ src: 'images/rooms/standard/2.jpg', alt: 'Štandardná izba – interiér' },
{ src: 'images/rooms/standard/3.jpg', alt: 'Štandardná izba – výhľad' },
{ src: 'images/rooms/standard/4.jpg', alt: 'Štandardná izba – úložný priestor' },
{ src: 'images/rooms/standard/5.jpg', alt: 'Štandardná izba – detail' }
    ],

    premium: [
{ src: 'images/rooms/premium/1.jpg', alt: 'Premium izba – interiér' },
{ src: 'images/rooms/premium/2.jpg', alt: 'Premium izba – lôžko' },
{ src: 'images/rooms/premium/3.jpg', alt: 'Premium izba – výhľad' },
{ src: 'images/rooms/premium/4.jpg', alt: 'Premium izba – detaily' }
    ],

    emergency: [
{ src: 'images/rooms/emergency/1.jpg', alt: 'Núdzové prespanie – jedáleň' },
{ src: 'images/rooms/emergency/2.jpg', alt: 'Núdzové prespanie – podlaha' }
    ]
};


const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;

    document.getElementById('checkin').addEventListener('change', function() {
    const checkinDate = new Date(this.value);
    checkinDate.setDate(checkinDate.getDate() + 1);
    document.getElementById('checkout').min = checkinDate.toISOString().split('T')[0];
});

function selectRoom(roomType) {
    selectedRoom = roomType;

    document.querySelectorAll('.room-card').forEach(card => {
    card.classList.remove('selected');
});

const card = event.currentTarget;
card.classList.add('selected');

const img = card.querySelector('.room-image img');
if (img && roomCardImages[roomType]) {
    img.src = roomCardImages[roomType];
}
}

function openGallery(roomType) {
const modal = document.getElementById('galleryModal');
const content = document.getElementById('galleryContent');

const images = galleryImages[roomType] || [];

    content.innerHTML = images.map(img =>
    `<div class="gallery-item">
            <img src="${img.src}" alt="${img.alt}">
        </div>`
    ).join('');

    modal.classList.add('active');
}

function closeGallery() {
    document.getElementById('galleryModal').classList.remove('active');
}

function selectPayment(method) {
    selectedPayment = method;
    document.getElementById(`payment-${method}`).checked = true;
    document.querySelectorAll('.payment-card').forEach(card => {
    card.classList.remove('selected');
});
    event.currentTarget.classList.add('selected');
}

function changeCounter(type, delta) {
    const min = type === 'adults' ? 1 : 0;
    counters[type] = Math.max(min, counters[type] + delta);
    document.getElementById(type).textContent = counters[type];

    if (type === 'children') {
    const agesGroup = document.getElementById('childrenAgesGroup');
    agesGroup.style.display = counters.children > 0 ? 'block' : 'none';
    }
}

function nextStep() {
    if (!validateStep(currentStep)) return;

    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('completed');
    document.getElementById(`step${currentStep}`).classList.remove('active');

    currentStep++;

    document.getElementById(`step${currentStep}`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');

    if (currentStep === 4) {
        updateSummary('summaryBoxPayment');
    }
    if (currentStep === 5) {
        updateSummary('summaryBoxFinal', true);
    }
}

function prevStep() {
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    document.getElementById(`step${currentStep}`).classList.remove('active');

    currentStep--;

    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('completed');
    document.getElementById(`step${currentStep}`).classList.add('active');
}

function validateStep(step) {
    if (step === 1) {
        if (!selectedRoom) {
            alert('Prosím vyberte typ ubytovania.');
        return false;
        }
    }

    if (step === 2) {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;

        if (!checkin || !checkout) {
            alert('Prosím vyplňte dátumy príchodu a odchodu.');
        return false;
        }

        if (new Date(checkout) <= new Date(checkin)) {
            alert('Dátum odchodu musí byť po dátume príchodu.');
        return false;
        }

        if (counters.adults < 1) {
            alert('Musí byť aspoň 1 dospelá osoba.');
        return false;
        }
    }

    if (step === 3) {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!firstName || !lastName || !email || !phone) {
            alert('Prosím vyplňte všetky povinné polia.');
        return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Prosím zadajte platnú e-mailovú adresu.');
        return false;
        }
    }

    if (step === 4) {
        if (!selectedPayment) {
            alert('Prosím vyberte spôsob platby.');
        return false;
        }
    }

    return true;
}

function updateSummary(elementId = 'summaryBox', includeFull = false) {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const adults = counters.adults;
    const children = counters.children;
    const dinner = document.getElementById('dinner').checked;
    const breakfast = document.getElementById('breakfast').checked;
    const bedding = document.getElementById('bedding').checked;

    const nights = checkin && checkout ? Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)) : 0;

    const roomPrice = selectedRoom ? roomPrices[selectedRoom] : 25;
    const basePrice = (adults + children) * nights * roomPrice;
    const dinnerPrice = dinner ? (adults + children) * nights * 15 : 0;
    const breakfastPrice = breakfast ? (adults + children) * nights * 12 : 0;
    const beddingPrice = bedding ? (adults + children) * 12 : 0;
    const total = basePrice + dinnerPrice + breakfastPrice + beddingPrice;

    let paymentMethod = '';
    if (selectedPayment === 'bank') paymentMethod = 'Bankový prevod';
    else if (selectedPayment === 'cash') paymentMethod = 'Platba na mieste';
    else if (selectedPayment === 'online') paymentMethod = 'Online platba';

    let summaryHtml = `
                ${includeFull ? `
                    <div class="summary-item">
                        <span>Meno:</span>
                        <span>${document.getElementById('firstName').value} ${document.getElementById('lastName').value}</span>
                    </div>
                    <div class="summary-item">
                        <span>E-mail:</span>
                        <span>${document.getElementById('email').value}</span>
                    </div>
                    <div class="summary-item">
                        <span>Telefón:</span>
                        <span>${document.getElementById('phone').value}</span>
                    </div>
                ` : ''}
                <div class="summary-item">
                    <span>Typ ubytovania:</span>
                    <span>${selectedRoom ? roomNames[selectedRoom] : '-'}</span>
                </div>
                <div class="summary-item">
                    <span>Termín:</span>
                    <span>${checkin || '-'} až ${checkout || '-'}</span>
                </div>
                <div class="summary-item">
                    <span>Počet nocí:</span>
                    <span>${nights}</span>
                </div>
                <div class="summary-item">
                    <span>Počet osôb:</span>
                    <span>${adults} dospelých${children > 0 ? ` + ${children} detí` : ''}</span>
                </div>
                <div class="summary-item">
                    <span>Ubytovanie:</span>
                    <span>${basePrice} €</span>
                </div>
                ${dinner ? `<div class="summary-item"><span>Večera:</span><span>${dinnerPrice} €</span></div>` : ''}
                ${breakfast ? `<div class="summary-item"><span>Raňajky:</span><span>${breakfastPrice} €</span></div>` : ''}
                ${bedding ? `<div class="summary-item"><span>Posteľné prádlo:</span><span>${beddingPrice} €</span></div>` : ''}
                ${includeFull && selectedPayment ? `<div class="summary-item"><span>Spôsob platby:</span><span>${paymentMethod}</span></div>` : ''}
                <div class="summary-item">
                    <span>Celková cena:</span>
                    <span>${total} €</span>
                </div>
            `;

    document.getElementById(elementId).innerHTML = summaryHtml;
}

function submitReservation() {
    document.getElementById('step5').classList.remove('active');
    document.getElementById('success').classList.add('active');
    document.querySelector(`.step[data-step="5"]`).classList.add('completed');

    console.log('Reservation submitted:', {
    room: selectedRoom,
    checkin: document.getElementById('checkin').value,
    checkout: document.getElementById('checkout').value,
    adults: counters.adults,
    children: counters.children,
    dinner: document.getElementById('dinner').checked,
    breakfast: document.getElementById('breakfast').checked,
    bedding: document.getElementById('bedding').checked,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    payment: selectedPayment
});
}

function resetForm() {
    document.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    counters.adults = 2;
    counters.children = 0;
    selectedRoom = null;
    selectedPayment = null;
    document.getElementById('adults').textContent = 2;
    document.getElementById('children').textContent = 0;

    currentStep = 1;
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');

    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');

    document.querySelectorAll('.room-card, .payment-card').forEach(card => {
        card.classList.remove('selected');
    });

}

document.getElementById('galleryModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeGallery();
    }
 });
