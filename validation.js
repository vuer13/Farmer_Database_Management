// Validation helper functions for backend input validation

function isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
}

function isNonNegativeNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
}

function isValidString(value, maxLength = 255) {
    return typeof value === 'string' && 
           value.trim().length > 0 && 
           value.length <= maxLength;
}

function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value) && value.length <= 80;
}

function isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && 
           !isNaN(date) && 
           date.getFullYear() >= 1900 && 
           date.getFullYear() <= 2100;
}

function isValidpH(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 14;
}

function isValidHealthRating(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1 && num <= 10;
}

function isValidBoolean(value) {
    return value === 0 || value === 1 || value === '0' || value === '1';
}

function isValidPercentage(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
}

module.exports = {
    isPositiveInteger,
    isNonNegativeNumber,
    isValidString,
    isValidEmail,
    isValidDate,
    isValidpH,
    isValidHealthRating,
    isValidBoolean,
    isValidPercentage
};

