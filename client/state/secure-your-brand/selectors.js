/**
 * Internal dependencies
 */
import 'state/secure-your-brand/init';

/**
 * Return WordPress secureYourBrand items getting from state object
 *
 * @param {object} state - current state object
 * @returns {Array} WordPress activePromotions
 */
export function getSecureYourBrand( state ) {
	return state.secureYourBrand.items;
}

/**
 * Return requesting state
 *
 * @param {object} state - current state object
 * @returns {boolean} is secureYourBrand requesting?
 */
export function isRequestingSecureYourBrand( state ) {
	return state.secureYourBrand.requesting;
}
