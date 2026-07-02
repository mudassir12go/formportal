const storageKey = 'reservationFormState';
const form = document.getElementById('reservationForm');
const footerStamp = document.getElementById('footerStamp');
const generatePdfButton = document.getElementById('generatePdfButton');
const resetFormButton = document.getElementById('resetFormButton');
const totalHoursField = document.getElementById('totalHours');

const formFields = [
  'vehicleSideNo',
  'vehiclePlateNo',
  'passengerName',
  'hotelName',
  'companyPersonName',
  'contactNumber',
  'reservationDate',
  'totalPassengers',
  'tripDuration',
  'requestedHours',
  'waitedHours',
  'totalHours',
  'selectTrip',
  'pickupLocation',
  'dropoffLocation',
  'pickupTime',
  'pickupPeriod',
  'dropoffTime',
  'dropoffPeriod',
  'preparedBy',
  'companyName',
  'paymentMethod',
  'totalFare'
];

function saveState() {
  const state = {};
  formFields.forEach((name) => {
    const element = document.getElementById(name);
    state[name] = element ? element.value : '';
  });
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return;
  }
  try {
    const state = JSON.parse(saved);
    formFields.forEach((name) => {
      const element = document.getElementById(name);
      if (element && state[name] !== undefined) {
        element.value = state[name];
      }
    });
  } catch (error) {
    console.warn('Could not restore saved form state.', error);
  }
}

function calculateTotalHours() {
  const requested = parseFloat(document.getElementById('requestedHours').value) || 0;
  const waited = parseFloat(document.getElementById('waitedHours').value) || 0;
  const total = requested + waited;
  totalHoursField.value = total > 0 ? total.toFixed(1) : '';
}

function validateInput(element) {
  if (!element) return true;
  const value = element.value.trim();
  const isSelect = element.tagName.toLowerCase() === 'select';

  if (element.required && !value) {
    return false;
  }

  if (element.id === 'contactNumber') {
    return /^[0-9]+$/.test(value);
  }

  if (element.id === 'totalFare') {
    return /^\d+(\.\d{1,2})?$/.test(value);
  }

  return true;
}

function validateForm() {
  let isValid = true;
  form.classList.add('was-validated');

  formFields.forEach((name) => {
    const element = document.getElementById(name);
    if (!element) return;
    const valid = validateInput(element);
    if (!valid) {
      element.classList.add('is-invalid');
      isValid = false;
    } else {
      element.classList.remove('is-invalid');
    }
  });
  return isValid;
}

function clearValidation() {
  form.classList.remove('was-validated');
  formFields.forEach((name) => {
    const element = document.getElementById(name);
    if (element) {
      element.classList.remove('is-invalid');
    }
  });
}

function resetForm() {
  form.reset();
  totalHoursField.value = '';
  localStorage.removeItem(storageKey);
  clearValidation();
}

function formatDateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFieldValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

function buildPdf() {
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const contentWidth = 210 - margin * 2;
  let y = 10;
  const headerLogo = document.querySelector('.header-logo');
  const pickupTime = getFieldValue('pickupTime') ? `${getFieldValue('pickupTime')} ${getFieldValue('pickupPeriod') || ''}` : '-';
  const dropoffTime = getFieldValue('dropoffTime') ? `${getFieldValue('dropoffTime')} ${getFieldValue('dropoffPeriod') || ''}` : '-';

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, contentWidth, 44, 8, 8, 'F');
  if (headerLogo && headerLogo.src) {
    try {
      const logoWidth = 76;
      const logoHeight = 44;
      const logoX = margin + (contentWidth - logoWidth) / 2;
      pdf.addImage(headerLogo.src, 'PNG', logoX, y + 2, logoWidth, logoHeight, undefined, 'FAST');
    } catch (error) {
      console.warn('Could not draw header logo in PDF.', error);
    }
  }
  y += 52;
  pdf.setFillColor(240, 246, 255);
  pdf.roundedRect(margin, y, contentWidth, 62, 6, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 77, 146);
  pdf.setFontSize(10);
  pdf.text('Reservation Details', margin + 6, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const leftCol = margin + 6;
  const midCol = margin + (contentWidth / 2) + 2;
  let lineY = y + 16;
  const lineStep = 6;
  pdf.setTextColor(47, 73, 108);
  pdf.text(`Vehicle Side No: ${getFieldValue('vehicleSideNo') || '-'}`, leftCol, lineY);
  pdf.text(`Vehicle Plate No: ${getFieldValue('vehiclePlateNo') || '-'}`, midCol, lineY);
  lineY += lineStep;
  pdf.text(`Passenger Name: ${getFieldValue('passengerName') || '-'}`, leftCol, lineY);
  pdf.text(`Hotel Name: ${getFieldValue('hotelName') || '-'}`, midCol, lineY);
  lineY += lineStep;
  pdf.text(`Company Person Name: ${getFieldValue('companyPersonName') || '-'}`, leftCol, lineY);
  pdf.text(`Contact Number: ${getFieldValue('contactNumber') || '-'}`, midCol, lineY);
  lineY += lineStep;
  pdf.text(`Reservation Date: ${formatDateLabel(getFieldValue('reservationDate')) || '-'}`, leftCol, lineY);
  pdf.text(`Total Passengers: ${getFieldValue('totalPassengers') || '-'}`, midCol, lineY);
  lineY += lineStep;
  pdf.text(`Trip Duration: ${getFieldValue('tripDuration') || '-'}`, leftCol, lineY);
  pdf.text(`Requested Hours: ${getFieldValue('requestedHours') || '-'}`, midCol, lineY);
  lineY += lineStep;
  pdf.text(`Waited Hours: ${getFieldValue('waitedHours') || '-'}`, leftCol, lineY);
  pdf.text(`Total Hours: ${getFieldValue('totalHours') || '-'}`, midCol, lineY);

  y += 70;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, contentWidth, 46, 6, 6, 'F');
  pdf.setDrawColor(15, 77, 146);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y + 10, margin + contentWidth, y + 10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 77, 146);
  pdf.text('Trip Information', margin + 6, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(47, 73, 108);
  pdf.text(`Select Trip: ${getFieldValue('selectTrip') || '-'}`, leftCol, y + 18);
  pdf.text(`Pickup Location: ${getFieldValue('pickupLocation') || '-'}`, leftCol, y + 24);
  pdf.text(`Dropoff Location: ${getFieldValue('dropoffLocation') || '-'}`, leftCol, y + 30);
  pdf.text(`Pickup Time: ${pickupTime}`, midCol, y + 18);
  pdf.text(`Dropoff Time: ${dropoffTime}`, midCol, y + 24);

  y += 54;
  pdf.setFillColor(240, 246, 255);
  pdf.roundedRect(margin, y, contentWidth, 36, 6, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 77, 146);
  pdf.text('Payment & Approval', margin + 6, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(47, 73, 108);
  pdf.text(`Payment Method: ${getFieldValue('paymentMethod') || '-'}`, leftCol, y + 18);
  pdf.text(`Total Fare: ${getFieldValue('totalFare') || '-'}`, leftCol, y + 24);
  pdf.text(`Prepared By: ${getFieldValue('preparedBy') || '-'}`, midCol, y + 18);
  pdf.text(`Company Name: ${getFieldValue('companyName') || '-'}`, midCol, y + 24);

  const stampWidth = 44;
  const stampHeight = 25;
  const stampX = margin + contentWidth - stampWidth;
  const stampY = y + 4;
  if (footerStamp && footerStamp.src) {
    try {
      pdf.addImage(footerStamp.src, 'PNG', stampX, stampY, stampWidth, stampHeight, undefined, 'FAST');
    } catch (error) {
      console.warn('Could not draw stamp image in PDF.', error);
    }
  }

  y += 54;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(104, 120, 146);
  pdf.text('This reservation form is generated offline for internal limousine booking use only.', margin + 6, y + 4);
  pdf.text(`Generated: ${new Date().toLocaleString('en-GB', { hour12: false })}`, margin + 6, y + 10);

  return pdf;
}

function handleGeneratePdf() {
  clearValidation();
  if (!validateForm()) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const doc = buildPdf();
  const filename = `Reservation_Form_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);

  const clear = window.confirm('Reservation PDF downloaded successfully. Do you want to clear the form?');
  if (clear) {
    resetForm();
  }
}

function addFieldListeners() {
  formFields.forEach((name) => {
    const element = document.getElementById(name);
    if (!element) return;
    element.addEventListener('input', () => {
      if (name === 'requestedHours' || name === 'waitedHours') {
        calculateTotalHours();
      }
      saveState();
    });
    element.addEventListener('change', saveState);
  });

  generatePdfButton.addEventListener('click', handleGeneratePdf);
  resetFormButton.addEventListener('click', () => {
    const confirmReset = window.confirm('Do you want to clear the form?');
    if (confirmReset) {
      resetForm();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  calculateTotalHours();
  addFieldListeners();
});
