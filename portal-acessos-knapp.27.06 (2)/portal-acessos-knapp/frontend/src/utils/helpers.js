// frontend/src/utils/helpers.js

/**
 * Valida se uma string é um JSON válido.
 * @param {string} str A string a ser validada.
 * @returns {boolean} True se a string for um JSON válido, caso contrário, False.
 */
export const isJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};