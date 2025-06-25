// Get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                document.getElementById('location').value = `${latitude}, ${longitude}`;
                // Add the location to the address field
                const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const currentAddress = document.getElementById('address').value;
                document.getElementById('address').value = currentAddress + 
                    (currentAddress ? '\n' : '') + 
                    `رابط الموقع: ${locationLink}`;
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert('من فضلك اسمح للموقع بتحديد مكانك');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('معلومات الموقع غير متوفرة');
                        break;
                    case error.TIMEOUT:
                        alert('انتهت مهلة طلب تحديد الموقع');
                        break;
                    default:
                        alert('حدث خطأ غير معروف');
                        break;
                }
            }
        );
    } else {
        alert('متصفحك لا يدعم تحديد الموقع');
    }
}

function loadCustomers() {
    try {
        return JSON.parse(localStorage.getItem('customers')) || [];
    } catch (error) {
        return [];
    }
}

function saveCustomers(customers) {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function checkCustomerRewards(fullName, phone) {
    const customers = loadCustomers();
    const customer = customers.find(c => c.phone === phone);
    
    if (customer) {
        customer.orders++;
        if (customer.orders === 15 && !customer.rewardClaimed) {
            showRewardModal(fullName);
            customer.rewardClaimed = true;
        }
    } else {
        customers.push({
            fullName,
            phone,
            orders: 1,
            rewardClaimed: false
        });
    }
    saveCustomers(customers);
}

function showRewardModal(fullName) {
    const modal = document.createElement('div');
    modal.className = 'reward-modal';
    modal.innerHTML = `
        <div class="reward-content">
            <h2>🎉 مبروك! 🎉</h2>
            <p>أهلاً بك في عائلتنا المميزة!</p>
            <p>لقد طلبت منا 15 مرة، لذا نقدم لك مكافأة خاصة:</p>
            <div class="reward-options">
                <div class="reward-option">
                    <input type="radio" id="discount10" name="reward" value="10%">
                    <label for="discount10">خصم 10% على طلبك التالي</label>
                </div>
                <div class="reward-option">
                    <input type="radio" id="freeDelivery" name="reward" value="freeDelivery">
                    <label for="freeDelivery">توصيل مجاني لطلبك التالي</label>
                </div>
            </div>
            <button onclick="selectReward()">اختيار المكافأة</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectReward() {
    const selectedReward = document.querySelector('input[name="reward"]:checked');
    if (selectedReward) {
        const reward = selectedReward.value;
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        
        const customers = loadCustomers();
        const customer = customers.find(c => c.phone === phone);
        if (customer) {
            customer.reward = reward;
            saveCustomers(customers);
            
            // إضافة المكافأة إلى رسالة الواتساب
            const message = `*Delivery Fast ⚡️*
` +
                `--------------------------------
` +
                `طلب جديد 📦
` +
                `--------------------------------
` +
                `👤 الاسم: ${fullName}
` +
                `📱 رقم الهاتف: ${phone}
` +
                `📍 العنوان: ${address}
` +
                (location ? `📌 الموقع: ${location}
` : '') +
                `${paymentIcon} طريقة الدفع: ${paymentText}
` +
                `--------------------------------
` +
                `🛒 تفاصيل الطلب:
${orderDetails}
` +
                `--------------------------------
` +
                (complaints ? `📝 الشكاوى والملاحظات:
${complaints}
` : '') +
                `🕒 *وقت الطلب:* ${new Date().toLocaleString('ar-EG')}
` +
                `--------------------------------
` +
                `🎁 *مكافأة العميل المميز:* ${reward === '10%' ? 'خصم 10%' : 'توصيل مجاني'}
` +
                `--------------------------------
` +
                `شكراً لاختياركنا! 🙏`;

            alert('تم اختيار المكافأة بنجاح! سيتم تطبيقها على طلبك التالي');
            document.querySelector('.reward-modal').remove();
            
            // تحديث رسالة الواتساب
            window.location.href = `https://wa.me/201026530586?text=${encodeURIComponent(message)}`;
        }
    }
}

function sendOrder(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const orderDetails = document.getElementById('orderDetails').value;
    const location = document.getElementById('location').value;
    const complaints = document.getElementById('complaints').value;

    if (!fullName || !phone || !address || !orderDetails) {
        alert('من فضلك أكمل كل البيانات');
        return false;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const paymentIcon = paymentMethod === 'cash' ? '💵' : '💳';
    const paymentText = paymentMethod === 'cash' ? 'كاش' : 'محفظة إلكترونية';

    checkCustomerRewards(fullName, phone);

    const message = `Delivery Fast ⚡️
` +
        `--------------------------------
` +
        `طلب جديد 📦
` +
        `--------------------------------
` +
        `👤 الاسم: ${fullName}
` +
        `📱 رقم الهاتف: ${phone}
` +
        `📍 *العنوان:* ${address}
` +
        (location ? `📌 الموقع: ${location}\n` : '') +
        `${paymentIcon} طريقة الدفع: ${paymentText}\n` +
        `--------------------------------
` +
        `🛒 تفاصيل الطلب:
${orderDetails}\n` +
        `--------------------------------
` +
        (complaints ? `📝 الشكاوى والملاحظات:
${complaints}\n` + `--------------------------------
` : '') +
        `🕒 *وقت الطلب:* ${new Date().toLocaleString('ar-EG')}
` +
        `--------------------------------\n` +
        `شكراً لاختياركنا! 🙏`;

    alert('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً 🚀');

    document.getElementById('fullName').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('orderDetails').value = '';
    document.getElementById('location').value = '';
    document.getElementById('complaints').value = '';
    document.querySelector('input[name="paymentMethod"]:checked').checked = false;

    window.location.href = `https://wa.me/201026530586?text=${encodeURIComponent(message)}`;
    return false;
}

// Submit order
function submitOrder() {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const orderDetails = document.getElementById('orderDetails').value;
    const notes = document.getElementById('notes').value;

    if (!fullName || !phone || !address || !orderDetails) {
        alert('من فضلك أكمل كل البيانات المطلوبة');
        return;
    }

    // Format the order message
    const message = `🛍️ *طلب جديد*\n\n` +
        `👤 *الاسم:* ${fullName}\n` +
        `📱 *رقم الهاتف:* ${phone}\n` +
        `📍 *العنوان:* ${address}\n\n` +
        `🛒 *تفاصيل الطلب:*\n${orderDetails}\n\n` +
        (notes ? `📝 *ملاحظات إضافية:*\n${notes}\n\n` : '') +
        `\n🕒 *وقت الطلب:* ${new Date().toLocaleString('ar-EG')}`;

    // Save order to local storage
    saveOrder({
        fullName,
        phone,
        address,
        orderDetails,
        notes,
        timestamp: new Date().toLocaleString()
    });

    // فتح الواتساب مباشرة مع الرسالة
    const whatsappUrl = `https://wa.me/201273381280?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;

    // Clear the form
    clearForm();
}

// Save order to local storage
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Clear the form after submission
function clearForm() {
    document.getElementById('fullName').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('orderDetails').value = '';
    document.getElementById('notes').value = '';
}

// Save user name
function saveUserName() {
    const userName = document.getElementById('userName').value;
    if (userName.trim()) {
        localStorage.setItem('userName', userName);
        currentUser = userName;
        checkUser();
        updateUserInfo();
        
        // Log user activity
        const timestamp = new Date().toLocaleString();
        const userActivity = JSON.parse(localStorage.getItem('userActivity') || '[]');
        userActivity.push({ user: userName, timestamp: timestamp });
        localStorage.setItem('userActivity', JSON.stringify(userActivity));
    }
}

// Check if user is logged in
function checkUser() {
    const loginSection = document.getElementById('loginSection');
    if (currentUser) {
        loginSection.style.display = 'none';
    } else {
        loginSection.style.display = 'block';
    }
}

// Update user info display
function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (currentUser) {
        userInfo.innerHTML = `أهلاً ${currentUser} | <button onclick="logout()">تسجيل خروج</button>`;
    } else {
        userInfo.innerHTML = '';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userName');
    currentUser = null;
    cart = [];
    updateCart();
    checkUser();
    updateUserInfo();
}

// Submit order
function submitOrder() {
    if (cart.length === 0) {
        alert('السلة فارغة');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const orderDetails = cart.map(item => item.name).join('\n');
    const message = `طلب جديد من: ${currentUser}\n\nالطلبات:\n${orderDetails}\n\nالمجموع: ${total} جنيه`;
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/201273381280?text=${encodeURIComponent(message)}`, '_blank');
    
    // Clear cart after order
    cart = [];
    updateCart();
}

// Initialize the page when loaded
window.onload = init;

// Add scroll effect for navigation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        nav.style.transform = 'translateY(0)';
    } else {
        nav.style.transform = 'translateY(-100%)';
    }
});

// Add smooth transition
document.querySelector('nav').style.transition = 'transform 0.3s ease-in-out';
