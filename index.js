const form = document.getElementById('upiForm');
const qrContainer = document.getElementById('qrContainer');
const canvas = document.getElementById('qrCanvas');
const paInput = document.getElementById('pa');
const amountInput = document.getElementById('am');
const noteInput = document.getElementById('tn');

function isValidUPI(upi) {
  return /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upi);
}

function isValidAmount(val) {
  return /^(?:[1-9]\d{0,4}|100000)$/.test(val);
}

function isValidNote(val) {
  return /^[\w\s.,'"\-!?:;()&]{0,200}$/.test(val);
}

function generateQR() {
  const upiId = paInput.value.trim();
  const amt = amountInput.value.trim();
  const note = noteInput.value.trim();

  if (!isValidUPI(upiId) || (amt && !isValidAmount(amt)) || (note && !isValidNote(note))) {
    qrContainer.classList.add('hidden');
    return;
  }

  const params = [`pa=${encodeURIComponent(upiId)}`];
  if (amt) params.push(`am=${amt}`);
  if (note) params.push(`tn=${encodeURIComponent(note)}`);

  const link = `upi://pay?${params.join('&')}`;
  const size = window.innerWidth < 400 ? 200 : 256;

  QRCode.toCanvas(canvas, link, { width: size, margin: 2, color: { dark: '#000', light: '#fff' } }, err => {
    if (!err) qrContainer.classList.remove('hidden');
  });
}

form.addEventListener('input', () => {
  clearTimeout(form.debounce);
  form.debounce = setTimeout(generateQR, 100);
});

document.getElementById('shareBtn').addEventListener('click', () => {
  canvas.toBlob(blob => {
    const file = new File([blob], 'upi-qr.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'UPI QR Code', text: 'Scan to pay via UPI' });
    } else {
      const link = document.createElement('a');
      link.download = 'upi-qr.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  });
});

document.getElementById('openUpiBtn').addEventListener('click', () => {
  const upiId = paInput.value.trim();
  const amt = amountInput.value.trim();
  const note = noteInput.value.trim();
  if (!isValidUPI(upiId) || (amt && !isValidAmount(amt)) || (note && !isValidNote(note))) return;
  const params = new URLSearchParams({ pa: upiId });
  if (amt) params.set('am', amt);
  if (note) params.set('tn', note);
  window.location.href = `upi://pay?${params}`;
});

window.addEventListener('resize', generateQR);
window.addEventListener('load', generateQR);