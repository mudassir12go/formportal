const storageKey = 'reservationFormState';
const form = document.getElementById('reservationForm');
const footerStamp = document.getElementById('footerStamp');
const generatePdfButton = document.getElementById('generatePdfButton');
const resetFormButton = document.getElementById('resetFormButton');
const totalHoursField = document.getElementById('totalHours');

const formFields = [
  'vehicleSideNo',
  'vehiclePlateNo',
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
  if (!saved) return;
  try {
    const state = JSON.parse(saved);
    formFields.forEach((name) => {
      const element = document.getElementById(name);
      if (element && state[name] !== undefined) element.value = state[name];
    });
  } catch (err) {
    console.warn('Could not restore saved form state.', err);
  }
}

function calculateTotalHours() {
  // Total Hours is now manual — no auto-calculation
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
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 12;
  const headerLogo = document.querySelector('.header-logo');
  const reservationDateRaw = getFieldValue('reservationDate') || '';
  const reservationDate = reservationDateRaw || '-';
  const pickupTime = getFieldValue('pickupTime') ? `${getFieldValue('pickupTime')} ${getFieldValue('pickupPeriod') || ''}` : '-';
  const dropoffTime = getFieldValue('dropoffTime') ? `${getFieldValue('dropoffTime')} ${getFieldValue('dropoffPeriod') || ''}` : '-';

  const colors = {
    primary: { r: 92, g: 106, b: 196 },   // #5c6ac4
    accent: { r: 92, g: 106, b: 196 },    // #5c6ac4
    background: { r: 241, g: 245, b: 249 },
    dark: { r: 34, g: 34, b: 34 },
    border: { r: 200, g: 205, b: 215 },
    tableBorder: { r: 92, g: 106, b: 196 },  // #5c6ac4 for row borders
    fareBg: { r: 92, g: 106, b: 196 },     // #5c6ac4 for Total AED
    footerBar: { r: 92, g: 106, b: 196 },
    white: { r: 255, g: 255, b: 255 },
    labelBlue: { r: 92, g: 106, b: 196 }   // #5c6ac4 for labels
  };

  // No left accent border — clean design matching the reference image

  // ──────────────────────────────────────────
  // HEADER: Logo left, Reservation Date right
  // ──────────────────────────────────────────
  if (typeof logoBase64 !== 'undefined') {
    try {
      pdf.addImage(logoBase64, 'PNG', margin + 2, y, 45, 45, undefined, 'FAST');
    } catch (error) {
      console.warn('Could not draw header logo in PDF.', error);
    }
  }

  // Reservation Date label (right side, grey text)
  const rightEdge = margin + contentWidth;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text('Reservation Date', rightEdge, y + 12, { align: 'right' });

  // Date value in gold/orange color
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.text(reservationDate, rightEdge, y + 20, { align: 'right' });

  y += 52;

  y += 4;
  const infoStartY = y;

  // ──────────────────────────────────────────
  // INFO SECTION BACKGROUND (Full width)
  // ──────────────────────────────────────────
  pdf.setFillColor(241, 245, 249); // #f1f5f9
  pdf.rect(0, y, pageWidth, 54, 'F');

  y += 8;

  // ──────────────────────────────────────────
  // INFO SECTION: Vehicle Info (left) + Customer Info (right-aligned)
  // ──────────────────────────────────────────
  const leftCol = margin + 4;
  const rightCol = margin + contentWidth - 4;

  // Vehicle Information heading
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text('Vehicle Information', leftCol, y + 6);

  // Customer Information heading (right-aligned)
  pdf.text('Customer Information', rightCol, y + 6, { align: 'right' });

  y += 14;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);

  // Vehicle details (left side)
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(`Side Number: ${getFieldValue('vehicleSideNo') || '-'}`, leftCol, y);
  y += 6;
  pdf.text(`Plate Number: ${getFieldValue('vehiclePlateNo') || '-'}`, leftCol, y);

  // Customer details (right-aligned)
  let custY = infoStartY + 22;
  pdf.text(`Passenger Name: ${getFieldValue('passengerName') || '-'}`, rightCol, custY, { align: 'right' });
  custY += 6;
  pdf.text(`Hotel Name: ${getFieldValue('hotelName') || '-'}`, rightCol, custY, { align: 'right' });
  custY += 6;
  pdf.text(`Company Person Name: ${getFieldValue('companyPersonName') || '-'}`, rightCol, custY, { align: 'right' });
  custY += 6;
  pdf.text(`Contact Number: ${getFieldValue('contactNumber') || '-'}`, rightCol, custY, { align: 'right' });
  custY += 6;
  pdf.text(`Total Passengers: ${getFieldValue('totalPassengers') || '-'}`, rightCol, custY, { align: 'right' });

  y = infoStartY + 54 + 12; // Start table below the background block (increased from 48 to 54)

  // ──────────────────────────────────────────
  // TRIP DETAILS TABLE
  // ──────────────────────────────────────────
  const tableX = margin + 6;
  const tableWidth = contentWidth - 12;
  const headerHeight = 12;
  const rowHeight = 14;
  const headers = ['#', 'Trip Name', 'Pickup Location', 'Dropoff Location', 'PickUp Time', 'DropOff Time'];

  // helper to format time to 12-hour
  function formatTime12(value, period) {
    if (!value || value === '-') return '-';
    if (period && period.trim()) return `${value} ${period}`;
    const m = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return value;
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh.toString().padStart(2, '0')}:${mm} ${ampm}`;
  }

  const pickupTimeFormatted = formatTime12(getFieldValue('pickupTime'), getFieldValue('pickupPeriod'));
  const dropoffTimeFormatted = formatTime12(getFieldValue('dropoffTime'), getFieldValue('dropoffPeriod'));

  const valuesFormatted = [
    `1.`,
    getFieldValue('selectTrip') || '-',
    getFieldValue('pickupLocation') || '-',
    getFieldValue('dropoffLocation') || '-',
    pickupTimeFormatted,
    dropoffTimeFormatted
  ];

  // Column widths
  const colFracs = [0.05, 0.15, 0.22, 0.22, 0.18, 0.18];
  const colWidths = colFracs.map((f) => Math.round(f * tableWidth * 100) / 100);
  const totalCols = colWidths.reduce((s, v) => s + v, 0);
  const colGap = Math.round((tableWidth - totalCols) * 100) / 100;
  colWidths[colWidths.length - 1] += colGap;

  // Table header - white background (clean look matching reference)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(tableX, y, tableWidth, headerHeight, 'F');

  // Header text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  let cx = tableX;
  for (let i = 0; i < headers.length; i++) {
    const w = colWidths[i];
    pdf.text(headers[i], cx + w / 2, y + headerHeight - 4, { align: 'center', maxWidth: w - 2 });
    cx += w;
  }

  // Header border bottom
  pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setLineWidth(0.6);
  pdf.line(tableX, y + headerHeight, tableX + tableWidth, y + headerHeight);

  // Body row
  const bodyY = y + headerHeight;

  // Only draw bottom border for row
  pdf.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
  pdf.setLineWidth(0.2);
  pdf.line(tableX, bodyY + rowHeight, tableX + tableWidth, bodyY + rowHeight);

  // Values
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  cx = tableX;
  for (let i = 0; i < valuesFormatted.length; i++) {
    const w = colWidths[i];
    const ty = bodyY + rowHeight / 2 + 3;
    pdf.text(valuesFormatted[i], cx + w / 2, ty, { align: 'center', maxWidth: w - 2 });
    cx += w;
  }

  y = bodyY + rowHeight;

  // ──────────────────────────────────────────
  // TOTAL AED BOX (horizontal, right-aligned)
  // ──────────────────────────────────────────
  const fareVal = getFieldValue('totalFare') || '0';
  const fareLabelText = 'Total AED:';
  const fareAmountText = fareVal.length > 12 ? fareVal.slice(0, 12) + '…' : fareVal;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  const labelPartW = pdf.getTextWidth(fareLabelText) + 8; // Reduced padding
  const amountPartW = pdf.getTextWidth(fareAmountText) + 10; // Reduced padding
  const fareBoxHeight = 10;
  const totalFareW = labelPartW + amountPartW;
  const fareBoxX = tableX + tableWidth - totalFareW;
  const fareBoxY = y;

  // Solid purple background for the whole box
  pdf.setFillColor(colors.fareBg.r, colors.fareBg.g, colors.fareBg.b);
  pdf.rect(fareBoxX, fareBoxY, totalFareW, fareBoxHeight, 'F');
  
  // Subtle vertical line separator (faint white/purple blend)
  pdf.setDrawColor(173, 180, 225);
  pdf.setLineWidth(0.25);
  pdf.line(fareBoxX + labelPartW, fareBoxY, fareBoxX + labelPartW, fareBoxY + fareBoxHeight);

  // "Total AED:" in white
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10); // Matched size with the amount
  pdf.setTextColor(255, 255, 255);
  pdf.text(fareLabelText, fareBoxX + labelPartW / 2, fareBoxY + fareBoxHeight / 2, { align: 'center', baseline: 'middle' });

  // Amount in white
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(fareAmountText, fareBoxX + labelPartW + amountPartW / 2, fareBoxY + fareBoxHeight / 2, { align: 'center', baseline: 'middle' });

  y = fareBoxY + fareBoxHeight + 12;

  // ──────────────────────────────────────────
  // HOURS SECTION
  // ──────────────────────────────────────────
  const detailsX = margin + 8;

  // Requested Hours
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Requested Hours', detailsX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('requestedHours') || '-', detailsX, y + 5);

  y += 10;
  // Waited Hours
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Waited Hours', detailsX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('waitedHours') || '-', detailsX, y + 5);

  y += 10;
  // Total Hours
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Total Hours', detailsX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('totalHours') || '-', detailsX, y + 5);

  y += 12;

  // ──────────────────────────────────────────
  // PAYMENT, PREPARED BY, COMPANY NAME
  // ──────────────────────────────────────────
  // Payement Method (matching the reference spelling)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Payement Method', detailsX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('paymentMethod') || '-', detailsX, y + 5);

  y += 10;
  // Prepared By
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Prepared By', detailsX, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('preparedBy') || '-', detailsX, y + 6);

  y += 10;
  // Company Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(colors.labelBlue.r, colors.labelBlue.g, colors.labelBlue.b);
  pdf.text('Company Name', detailsX, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  pdf.text(getFieldValue('companyName') || '-', detailsX, y + 6);

  y += 10;

  // ──────────────────────────────────────────
  // STAMP IMAGE (bottom-left, well above footer)
  // ──────────────────────────────────────────
  const stampX = detailsX;
  const stampHeight = 28;
  const stampWidth = 28;
  // Place stamp so it ends at 273mm (24mm above page bottom)
  const stampY = 245;

  if (typeof stampBase64 !== 'undefined') {
    try {
      pdf.addImage(stampBase64, 'PNG', stampX, stampY, stampWidth, stampHeight, undefined, 'FAST');
    } catch (error) {
      console.warn('Could not draw stamp image in PDF.', error);
    }
  }

  // ──────────────────────────────────────────
  // FOOTER with #f1f5f9 background
  // ──────────────────────────────────────────
  const footerBgHeight = 14;
  const footerBgY = pageHeight - footerBgHeight;
  pdf.setFillColor(241, 245, 249); // #f1f5f9
  pdf.rect(0, footerBgY, pageWidth, footerBgHeight, 'F');

  const footerY = pageHeight - 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Info@bestprincesslimousine.com', pageWidth / 2, footerY, { align: 'center' });

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
  addFieldListeners();
});
