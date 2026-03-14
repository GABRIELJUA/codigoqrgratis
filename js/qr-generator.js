// ===============================
// TEMA OSCURO
// ===============================

const savedTheme = localStorage.getItem("qr_dark");

if (savedTheme === "true") {
    document.body.classList.add("dark");
}

function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("qr_dark", document.body.classList.contains("dark"));
}

// ===============================
// INICIALIZAR QR
// ===============================

const qr = new QRCodeStyling({
    width: 1200,
    height: 1200,
    type: "canvas",
    data: "",
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { color: "#000", type: "rounded" },
    backgroundOptions: { color: "#fff" },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.4
    }
});

const qrContainer = document.getElementById("qr");

if (qrContainer) {
    qr.append(qrContainer);
}

// ===============================
// CAMPOS DINÁMICOS
// ===============================

const type = document.getElementById("type");
const fields = document.getElementById("fields");

function renderFields() {

    if (!fields || !type) return;

    let html = "";

    switch (type.value) {
        case "url":
            html = '<input id="data" placeholder="https://..." inputmode="url">';
            break;
        case "text":
            html = '<input id="data" placeholder="Texto">';
            break;
        case "wifi":
            html = '<input id="ssid" placeholder="Nombre de red (SSID)"><input id="pass" placeholder="Contraseña (opcional)">';
            break;
        case "whatsapp":
            html = '<input id="data" placeholder="Ej. 521234567890" inputmode="numeric">';
            break;
        case "instagram":
            html = '<input id="data" placeholder="Usuario sin @">';
            break;
        case "email":
            html = '<input id="data" placeholder="correo@dominio.com" inputmode="email">';
            break;
        case "phone":
            html = '<input id="data" placeholder="Solo números" inputmode="numeric">';
            break;
    }

    fields.innerHTML = html;
    bindRealtime();
}

type?.addEventListener("change", renderFields);
renderFields();

// ===============================
// VALIDACIÓN
// ===============================

function cleanPhone(value = "") {
    return value.replace(/\D/g, "");
}

function validateUrl(value = "") {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function validate() {

    const error = document.getElementById("error");
    if (!error || !type) return true;

    error.innerText = "";

    if (type.value === "wifi") {
        const ssid = document.getElementById("ssid")?.value?.trim();

        if (!ssid) {
            error.innerText = "Debes ingresar el nombre de red (SSID).";
            return false;
        }

        return true;
    }

    const data = document.getElementById("data")?.value?.trim() || "";

    if (!data) {
        error.innerText = "Debes ingresar un valor.";
        return false;
    }

    if (type.value === "url" && !validateUrl(data)) {
        error.innerText = "Ingresa una URL válida que comience con http:// o https://";
        return false;
    }

    if (type.value === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailRegex.test(data)) {
            error.innerText = "Ingresa un correo electrónico válido.";
            return false;
        }
    }

    if (type.value === "phone" || type.value === "whatsapp") {
        const digits = cleanPhone(data);

        if (digits.length < 8 || digits.length > 15) {
            error.innerText = "Ingresa un número válido de 8 a 15 dígitos.";
            return false;
        }
    }

    if (type.value === "instagram") {
        const username = data.replace(/^@/, "");
        const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;

        if (!instagramRegex.test(username)) {
            error.innerText = "El usuario de Instagram solo puede tener letras, números, punto y guion bajo.";
            return false;
        }
    }

    return true;
}

// ===============================
// CONSTRUIR DATA
// ===============================

function buildData() {

    if (!type) return "";

    switch (type.value) {
        case "url":
        case "text":
            return document.getElementById("data")?.value?.trim() || "";

        case "wifi": {
            const ssid = document.getElementById("ssid")?.value?.trim() || "";
            const pass = document.getElementById("pass")?.value || "";

            return `WIFI:T:WPA;S:${ssid};P:${pass};;`;
        }

        case "whatsapp":
            return "https://wa.me/" + cleanPhone(document.getElementById("data")?.value || "");

        case "instagram": {
            const username = (document.getElementById("data")?.value || "").trim().replace(/^@/, "");
            return "https://instagram.com/" + username;
        }

        case "email":
            return "mailto:" + (document.getElementById("data")?.value?.trim() || "");

        case "phone":
            return "tel:" + cleanPhone(document.getElementById("data")?.value || "");

        default:
            return "";
    }
}

// ===============================
// ACTUALIZAR QR
// ===============================

function updateQR() {

    document.getElementById("qr-placeholder")?.remove();

    if (!validate()) {
        disableDownloadButtons();
        return;
    }

    let size = document.getElementById("size")?.value || 300;
    let margin = document.getElementById("margin")?.value || 5;
    let color = document.getElementById("color")?.value || "#000000";
    let bg = document.getElementById("bg")?.value || "#ffffff";
    let gradient = document.getElementById("gradient")?.checked;
    let gradientColor = document.getElementById("gradientColor")?.value || "#6366f1";
    let logoSize = document.getElementById("logoSize")?.value || 0.4;

    let style = document.getElementById("qrStyle")?.value || "rounded";
    let cornerStyle = document.getElementById("cornerStyle")?.value || "square";

    let dots;

    if (gradient) {
        dots = {
            type: style,
            gradient: {
                type: "linear",
                rotation: 0,
                colorStops: [
                    { offset: 0, color: color },
                    { offset: 1, color: gradientColor }
                ]
            }
        };
    } else {
        dots = {
            color: color,
            type: style
        };
    }

    qr.update({
        data: buildData(),
        width: Number(size),
        height: Number(size),
        margin: Number(margin),
        dotsOptions: dots,
        cornersSquareOptions: {
            type: cornerStyle
        },
        cornersDotOptions: {
            type: cornerStyle
        },
        backgroundOptions: { color: bg },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 5,
            imageSize: Number(logoSize)
        }
    });

    enableDownloadButtons();
}

function resetAll() {
    document.querySelectorAll('.form-grid input, .form-grid select').forEach((el) => {
        if (el.type === "checkbox") {
            el.checked = false;
            return;
        }

        if (el.type === "color") {
            el.value = el.id === "bg" ? "#ffffff" : "#000000";
            if (el.id === "gradientColor") el.value = "#6366f1";
            return;
        }

        if (el.type === "range") {
            if (el.id === "size") el.value = 300;
            if (el.id === "margin") el.value = 5;
            if (el.id === "logoSize") el.value = 0.4;
            return;
        }

        if (el.type === "file") {
            el.value = "";
            return;
        }

        if (el.id === "data" || el.id === "ssid" || el.id === "pass") {
            el.value = "";
        }
    });

    toggleGradientControls();
    disableDownloadButtons();

    const error = document.getElementById("error");
    if (error) error.innerText = "";

    const placeholder = document.getElementById("qr-placeholder");
    if (!placeholder && qrContainer) {
        const div = document.createElement("div");
        div.id = "qr-placeholder";
        div.textContent = "Introduce información para generar tu código QR";
        qrContainer.appendChild(div);
    }

    qr.update({ data: "" });
}

function toggleGradientControls() {
    const gradient = document.getElementById("gradient");
    const controls = document.getElementById("gradientControls");

    if (!gradient || !controls) return;

    controls.classList.toggle("hidden", !gradient.checked);
}

// ===============================
// BOTONES
// ===============================

function enableDownloadButtons() {
    document.getElementById("btnPNG") && (document.getElementById("btnPNG").disabled = false);
    document.getElementById("btnSVG") && (document.getElementById("btnSVG").disabled = false);
    document.getElementById("btnPDF") && (document.getElementById("btnPDF").disabled = false);
    document.getElementById("btnPoster") && (document.getElementById("btnPoster").disabled = false);
}

function disableDownloadButtons() {
    document.getElementById("btnPNG") && (document.getElementById("btnPNG").disabled = true);
    document.getElementById("btnSVG") && (document.getElementById("btnSVG").disabled = true);
    document.getElementById("btnPDF") && (document.getElementById("btnPDF").disabled = true);
    document.getElementById("btnPoster") && (document.getElementById("btnPoster").disabled = true);
}

// ===============================
// DESCARGAS
// ===============================

function downloadQR(type) {
    qr.download({ name: "qr", extension: type });

    if (type === "png") showToast("QR descargado en PNG");
    if (type === "svg") showToast("QR descargado en SVG");
}

function downloadPDF() {
    const canvas = document.querySelector("#qr canvas");
    if (!canvas) return;

    const { jsPDF } = window.jspdf;

    showToast("QR descargado en PDF");

    setTimeout(() => {
        const pdf = new jsPDF();

        pdf.addImage(canvas.toDataURL(), "PNG", 40, 40, 120, 120);

        pdf.save("qr.pdf");
    }, 100);
}

// ===============================
// TOAST
// ===============================

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ===============================
// EVENTOS INPUT
// ===============================

function bindRealtime() {
    document.querySelectorAll(".form-grid input,.form-grid select").forEach(el => {
        el.addEventListener("input", updateQR);
        el.addEventListener("change", updateQR);
    });

    document.getElementById("gradient")?.addEventListener("change", toggleGradientControls);
}

bindRealtime();
toggleGradientControls();

// ===============================
// LOGO
// ===============================

document.getElementById("logo")?.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        qr.update({
            image: reader.result
        });

        updateQR();
    };

    reader.readAsDataURL(file);
});

function poster() {
    const canvas = document.querySelector("#qr canvas");

    if (!canvas) return;

    const poster = document.createElement("canvas");

    poster.width = 1240;
    poster.height = 1754;

    const ctx = poster.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, poster.width, poster.height);

    ctx.textAlign = "center";

    ctx.fillStyle = "#111";
    ctx.font = "bold 60px sans-serif";
    ctx.fillText("Escanea este código", poster.width / 2, 220);

    ctx.drawImage(canvas, 320, 420, 600, 600);

    ctx.fillStyle = "#777";
    ctx.font = "26px sans-serif";
    ctx.fillText("Escanea con la cámara de tu teléfono", poster.width / 2, 1150);

    const link = document.createElement("a");

    link.download = "qr-poster.png";
    link.href = poster.toDataURL();

    showToast("Poster generado correctamente");

    setTimeout(() => {
        link.click();
    }, 100);
}
