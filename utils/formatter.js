/**
 * DateTime formatting utilities
 * @module utils/formatter
 */

/**
 * International DateTimeFormatter for consistent timestamp formatting to be used to ensure the results.
 * 
 * This formatter creates human-readable, sortable date-time strings in the format:
 * "MM/DD/YYYY, HH:MM:SS" (24-hour format)
 * 
 * @constant {Intl.DateTimeFormat}
 * @example
 * // Output: "10/17/2025, 14:30:25"
 * const timestamp = formatter.format(new Date());
 * 
 * @property {string} locale - 'en-US' (U.S. English locale for consistent formatting)
 * @property {Object} options - Formatting configuration:
 * @property {string} options.year - 'numeric' (4-digit year, e.g., 2025)
 * @property {string} options.month - '2-digit' (zero-padded month, 01-12)
 * @property {string} options.day - '2-digit' (zero-padded day, 01-31)
 * @property {string} options.hour - '2-digit' (zero-padded hour, 00-23)
 * @property {string} options.minute - '2-digit' (zero-padded minute, 00-59)
 * @property {string} options.second - '2-digit' (zero-padded second, 00-59)
 * @property {boolean} options.hour12 - false (uses 24-hour format instead of 12-hour AM/PM)
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat | MDN Intl.DateTimeFormat}
 */
const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

module.exports = { formatter };