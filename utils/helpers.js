// utils/helpers.js

/**
 * Generate a random 10-digit mobile number string
 * Starts with 6-9 to ensure valid format
 */
function generateMobile() {
  const first = Math.floor(Math.random() * 4) + 6; // 6,7,8,9
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return `${first}${rest}`;
}

/**
 * Get today's date formatted as DD MMM YYYY (e.g. "04 Mar 2026")
 */
function getTodayFormatted() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();
  const day   = String(today.getDate()).padStart(2, '0');
  const month = months[today.getMonth()];
  const year  = today.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Get today's components for date picker interaction
 */
function getTodayParts() {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const today = new Date();
  return {
    day:   String(today.getDate()),
    month: months[today.getMonth()],
    year:  String(today.getFullYear()),
  };
}

module.exports = { generateMobile, getTodayFormatted, getTodayParts };
