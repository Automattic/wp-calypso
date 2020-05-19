/**
 * External dependencies
 */
import { isPlainObject } from 'lodash';

/**
 * @param {object} addressData Object representing the current address UI state.
 * - {object} addressData.values The address values, as entered by the user.
 * - {object} addressData.normalized The address values, if any, as returned by the address verification endpoint.
 * - {boolean} addressData.isNormalized True if the address has been normalized, false otherwise.
 * - {boolean} addressData.selectNormalized True if the user has chosen to accept the normalized address, false otherwise.
 * @returns {object} Object with the selected address values (postcode, country, state, etc), or an empty object on error.
 */
export default ( addressData ) => {
	if ( ! isPlainObject( addressData ) ) {
		return {};
	}
	const selectedValues =
		addressData.isNormalized && addressData.selectNormalized && addressData.normalized
			? addressData.normalized
			: addressData.values;
	return selectedValues || {};
};
