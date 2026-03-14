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
            html = '<input id="data" placeholder="https://...">';
            break;

        case "text":
            html = '<input id="data" placeholder="Texto">';
            break;

        case "wifi":
            html = '<input id="ssid" placeholder="SSID"><input id="pass" placeholder="Password">';
            break;

        case "whatsapp":
            html = '<input id="data" placeholder="Número">';
            break;

        case "instagram":
            html = '<input id="data" placeholder="Usuario">';
            break;

        case "email":
            html = '<input id="data" placeholder="email">';
            break;

        case "phone":
            html = '<input id="data" placeholder="Teléfono">';
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

function validate() {

    const error = document.getElementById("error");
    if (!error) return true;

    error.innerText = "";

    if (type.value === "wifi") {

        const ssid = document.getElementById("ssid")?.value;

        if (!ssid) {
            error.innerText = "Debes ingresar el SSID del WiFi.";
            return false;
        }
    }

    if (type.value !== "wifi") {

        const data = document.getElementById("data")?.value;

        if (!data) {
            error.innerText = "Debes ingresar un valor.";
            return false;
        }
    }

    return true;
}

// ===============================
// CONSTRUIR DATA
// ===============================

function buildData() {

    switch (type.value) {

        case "url":
        case "text":
            return document.getElementById("data")?.value || "";

        case "wifi":

            const ssid = document.getElementById("ssid")?.value || "";
            const pass = document.getElementById("pass")?.value || "";

            return `WIFI:T:WPA;S:${ssid};P:${pass};;`;

        case "whatsapp":
            return "https://wa.me/" + (document.getElementById("data")?.value || "");

        case "instagram":
            return "https://instagram.com/" + (document.getElementById("data")?.value || "");

        case "email":
            return "mailto:" + document.getElementById("data")?.value;

        case "phone":
            return "tel:" + document.getElementById("data")?.value;
    }
}

// ===============================
// ACTUALIZAR QR
// ===============================

function updateQR() {

    document.getElementById("qr-placeholder")?.remove();

    if (!validate()) return;

    let size = document.getElementById("size").value;
    let margin = document.getElementById("margin").value;
    let color = document.getElementById("color").value;
    let bg = document.getElementById("bg").value;
    let gradient = document.getElementById("gradient").checked;
    let gradientColor = document.getElementById("gradientColor")?.value || "#6366f1";
    let logoSize = document.getElementById("logoSize").value;

    let style = document.getElementById("qrStyle").value;
    let cornerStyle = document.getElementById("cornerStyle").value;

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

// ===============================
// BOTONES
// ===============================

function enableDownloadButtons() {

    document.getElementById("btnPNG").disabled = false;
    document.getElementById("btnSVG").disabled = false;
    document.getElementById("btnPDF").disabled = false;
    document.getElementById("btnPoster").disabled = false;
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
}

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