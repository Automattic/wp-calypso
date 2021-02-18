/**
 * Internal dependencies
 */
import 'calypso/state/secure-your-brand/init';

/**
 * Return WordPress secureYourBrand items getting from state object
 *
 * @param {object} state - current state object
 * @returns {Array} secureYourBrand data
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

/**
 * Return if the secure your brand request returned an error
 *
 * @param {object} state - current state object
 * @returns {boolean} is secureYourBrand an error
 */
export function hasSecureYourBrandError( state ) {
	return state.secureYourBrand.error === true;
}
