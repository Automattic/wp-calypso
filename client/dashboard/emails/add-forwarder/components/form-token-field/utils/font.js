/**
 * Internal dependencies
 */
import FONT from './font-values';

/**
 *
 * @param {keyof FONT} value Path of value from `FONT`
 * @returns {string} Font rule value
 */
export function font( value ) {
	return FONT[ value ] ?? '';
}
