 //////----------ADMIN.HTML SCRIPT------////
 const firebaseConfig = {
    apiKey: "AIzaSyCXCsqN-xwQ-3_bt2dTaxbmywSW002zOW4",
    authDomain: "atlantic-fluids.firebaseapp.com",
    projectId: "atlantic-fluids",
    storageBucket: "atlantic-fluids.appspot.com",
    messagingSenderId: "92805829518",
    appId: "1:92805829518:web:4aadfe255fd9bdc2348adf"
};
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let selectedLogo = 'logo1.jpg';
let selectedWebsite = 'https://atlanticfluids.com/';
const companyAddress = "19, Jessy & Jenny Street, Off Peter Odili Road, Trans-Amadi, Port Harcourt, Rivers State, Nigeria.";

function selectLogo(element, logoPath) {
    document.querySelectorAll('.logo-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedLogo = logoPath;
}

function selectWebsite(element, websiteUrl) {
    document.querySelectorAll('.website-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedWebsite = websiteUrl;
}

function createField(type, containerId) {
    const container = document.getElementById(containerId);
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'dynamic-field-group';
    
    const input = document.createElement('input');
    input.type = type;
    input.className = type === 'tel' ? 'phone-input' : 'email-input';
    input.required = container.children.length === 0;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-field-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => removeField(removeBtn);
    
    fieldGroup.append(input, removeBtn);
    container.appendChild(fieldGroup);
}

function removeField(button) {
    const container = button.closest('.dynamic-field-group').parentElement;
    if (container.children.length > 1) {
        button.closest('.dynamic-field-group').remove();
    }
}

function addEmailField() {
    createField('email', 'emailContainer');
}

function addPhoneField() {
    createField('tel', 'phoneContainer');
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const social = {
        facebook: document.getElementById('facebook').value || null,
        twitter: document.getElementById('twitter').value || null,
        linkedin: document.getElementById('linkedin').value || null,
        instagram: document.getElementById('instagram').value || null
    };

    Object.keys(social).forEach(key => {
        if (!social[key]) delete social[key];
    });

    const userId = document.getElementById('userId').value;
    const qrUrl = `https://atlantic-fluids.github.io/v-card/?id=${encodeURIComponent(userId)}`;

    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",  // Black dots
        colorLight: "#ffffff", // White background
        correctLevel: QRCode.CorrectLevel.H
    });

    const qrBase64 = await new Promise((resolve) => {
        setTimeout(() => {
            const qrImg = qrContainer.querySelector('img');
            resolve(qrImg ? qrImg.src : null);
        }, 100);
    });

      // Add to form submission handler after QR generation
    const adminDownloadBtn = document.getElementById('adminDownloadBtn');
    adminDownloadBtn.disabled = false;
    adminDownloadBtn.onclick = () => {
        const qrImg = document.querySelector('#qrCodeContainer img');
        if (qrImg) {
            const userId = document.getElementById('userId').value;
            const link = document.createElement('a');
            link.href = qrImg.src;
            link.download = `atlantic-fluids-profile-${userId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const profileData = {
        userId: userId,
        fullname: document.getElementById('fullName').value,
        emails: Array.from(document.querySelectorAll('.email-input')).map(i => i.value),
        phones: Array.from(document.querySelectorAll('.phone-input')).map(i => i.value),
        logo: selectedLogo,
        website: selectedWebsite,
        address: companyAddress,
        social: social,
        qrCode: qrBase64,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('contacts').doc(userId).set(profileData);
        alert('Profile saved with QR Code!');
        
        document.getElementById('profileForm').reset();
        document.getElementById('emailContainer').innerHTML = '';
        document.getElementById('phoneContainer').innerHTML = '';
        addEmailField();
        addPhoneField();
        
        document.getElementById('facebook').value = '';
        document.getElementById('twitter').value = '';
        document.getElementById('linkedin').value = '';
        document.getElementById('instagram').value = '';
        
    } catch (error) {
        alert(`Error saving profile: ${error.message}`);
    }
});

window.onload = function() {
    if (document.getElementById('emailContainer').children.length === 0) {
        addEmailField();
    }
    if (document.getElementById('phoneContainer').children.length === 0) {
        addPhoneField();
    }
};
// Check if editing existing profile
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');

if (editId) {
    db.collection('contacts').doc(editId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            console.log("Fetched data for edit:", data); 
            
            // Fill basic fields
            document.getElementById('userId').value = data.userId || '';
            document.getElementById('userId').readOnly = true; // Prevent changing ID when editing
            document.getElementById('fullName').value = data.fullname || ''; // Changed to fullname to match data structure
            
            // Fill dynamic email fields
            const emailList = Array.isArray(data.emails) ? data.emails : [];
            document.getElementById('emailContainer').innerHTML = '';
            if (emailList.length > 0) {
                emailList.forEach(email => {
                    const fieldGroup = document.createElement('div');
                    fieldGroup.className = 'dynamic-field-group';
                    
                    const input = document.createElement('input');
                    input.type = 'email';
                    input.className = 'email-input';
                    input.value = email;
                    input.required = true;

                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-field-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => removeField(removeBtn);

                    fieldGroup.append(input, removeBtn);
                    document.getElementById('emailContainer').appendChild(fieldGroup);
                });
            } else {
                addEmailField();
            }

            // Handle phones safely
            const phoneList = Array.isArray(data.phones) ? data.phones : [];
            document.getElementById('phoneContainer').innerHTML = '';
            if (phoneList.length > 0) {
                phoneList.forEach(phone => {
                    const fieldGroup = document.createElement('div');
                    fieldGroup.className = 'dynamic-field-group';
                    
                    const input = document.createElement('input');
                    input.type = 'tel';
                    input.className = 'phone-input';
                    input.value = phone;
                    input.required = true;

                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-field-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => removeField(removeBtn);

                    fieldGroup.append(input, removeBtn);
                    document.getElementById('phoneContainer').appendChild(fieldGroup);
                });
            } else {
                addPhoneField();
            }
            
            // Fill social media fields
            if (data.social) {
                document.getElementById('facebook').value = data.social.facebook || '';
                document.getElementById('twitter').value = data.social.twitter || '';
                document.getElementById('linkedin').value = data.social.linkedin || '';
                document.getElementById('instagram').value = data.social.instagram || '';
            }
            
            // Set logo selection - match based on the stored value
            if (data.logo) {
                const logoOptions = document.querySelectorAll('.logo-option');
                logoOptions.forEach(option => {
                    if (option.getAttribute('onclick').includes(data.logo)) {
                        selectLogo(option, data.logo);
                    }
                });
            }
            
            // Set website selection
            if (data.website) {
                const websiteOptions = document.querySelectorAll('.website-option');
                websiteOptions.forEach(option => {
                    if (option.getAttribute('onclick').includes(data.website)) {
                        selectWebsite(option, data.website);
                    }
                });
            }
        }
    }).catch(error => {
        console.error("Error fetching profile for editing:", error);
    });
}