const DATA_URL = "https://raw.githubusercontent.com/fredy09rizky/c4nv4-fre3/refs/heads/main/link.json";

async function fetchLinks() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const links = await response.json();
        renderLinks(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        document.getElementById('linksContainer').innerHTML = '<p style="text-align:center; color:white;">Gagal memuat link. Silakan coba lagi nanti.</p>';
        document.getElementById('linkCount').textContent = '0';
    }
}

function renderLinks(links) {
    const container = document.getElementById('linksContainer');
    const countElement = document.getElementById('linkCount');

    countElement.textContent = links.length;

    container.innerHTML = '';

    links.forEach((link, index) => {
        const card = document.createElement('div');
        card.className = 'link-card';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0'; // Start hidden for animation

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">
                    <img src="attached_assets/canva.png" alt="Canva">
                </div>
                <div class="card-info">
                    <h3>${link.name}</h3>
                    <span>${link.description}</span>
                </div>
            </div>
            <div class="link-url-box">${link.url}</div>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="copyLink('${link.url}', this)">
                    <i class="fas fa-copy"></i>
                    Copy
                </button>
                <button class="btn btn-secondary" onclick="openLink('${link.url}')">
                    <i class="fas fa-external-link-alt"></i>
                    Buka
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function copyLink(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        button.classList.add('copied');

        showToast();

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        button.classList.add('copied');
        showToast();

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    });
}

function openLink(url) {
    window.open(url, '_blank');
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showPopup() {
    const popup = document.getElementById('popupOverlay');
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hidePopup() {
    const popup = document.getElementById('popupOverlay');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

function initPopup() {
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const laterBtn = document.getElementById('laterBtn');
    const subscribeBtn = document.getElementById('subscribeBtn');

    if (popupClose) popupClose.addEventListener('click', hidePopup);
    if (laterBtn) laterBtn.addEventListener('click', hidePopup);

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                hidePopup();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePopup();
        }
    });

    setTimeout(showPopup, 1000);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLinks();

    setTimeout(() => {
        hideLoadingScreen();

        setTimeout(() => {
            initPopup();
        }, 500);
    }, 1500);

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Anti-spam Check (Obfuscated)
            const STORAGE_KEY = 'c4nv4_s3ss_t';
            const lastSubmissionEncrypted = localStorage.getItem(STORAGE_KEY);

            if (lastSubmissionEncrypted) {
                try {
                    const lastSubmission = parseInt(atob(lastSubmissionEncrypted));
                    if (!isNaN(lastSubmission)) {
                        const timeSinceLastSubmission = Date.now() - lastSubmission;
                        const cooldownTime = 5 * 60 * 1000; // 5 minutes

                        if (timeSinceLastSubmission < cooldownTime) {
                            const remainingTime = Math.ceil((cooldownTime - timeSinceLastSubmission) / 1000 / 60);
                            alert(`Mohon tunggu ${remainingTime} menit sebelum mengirim pesan lagi.`);
                            return;
                        }
                    }
                } catch (err) {
                    // Invalid data, ignore
                    localStorage.removeItem(STORAGE_KEY);
                }
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        try {
                            localStorage.setItem(STORAGE_KEY, btoa(Date.now().toString()));
                        } catch (e) {
                            console.error('Storage error', e);
                        }
                        showThankYouPopup();
                        contactForm.reset();
                    } else {
                        alert('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan koneksi. Silakan periksa internet Anda.');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Thank You Popup Handling
    const thankYouPopup = document.getElementById('thankYouPopup');
    const thankYouClose = document.getElementById('thankYouClose');
    const thankYouOkBtn = document.getElementById('thankYouOkBtn');

    if (thankYouClose) {
        thankYouClose.addEventListener('click', () => {
            thankYouPopup.classList.remove('active');
        });
    }

    if (thankYouOkBtn) {
        thankYouOkBtn.addEventListener('click', () => {
            thankYouPopup.classList.remove('active');
        });
    }

    // Close popup when clicking outside
    if (thankYouPopup) {
        thankYouPopup.addEventListener('click', (e) => {
            if (e.target === thankYouPopup) {
                thankYouPopup.classList.remove('active');
            }
        });
    }
});

function showThankYouPopup() {
    const popup = document.getElementById('thankYouPopup');
    if (popup) {
        popup.classList.add('active');
    }
}
