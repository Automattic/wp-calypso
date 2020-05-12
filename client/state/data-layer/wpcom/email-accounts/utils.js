/**
 * External Dependencies
 */
import { isArray, get, set } from 'lodash';

/**
 * Internal dependencies
 */
import { convertToCamelCase } from 'state/data-layer/utils';

/**
 * Converts an array of email accounts into an object grouped by provider, and then domain.
 *
 * @param {Array} accounts list of accounts to convert
 * @returns {object} a new object grouped as described above.
 */
const groupByProviderAndDomain = ( accounts ) => {
	return accounts.reduce( ( aggregate, account ) => {
		const path = [ account.providerSlug, account.domain ];
		const state = get( aggregate, path, [] );
		state.push( account );
		return set( aggregate, path, state );
	}, {} );
};

/**
 * Prepares an object containing email accounts by ascertaining that it has a well-known shape, before adding to state.
 *
 * @param {object} accounts accounts to prepare
 * @returns {object} a new object in shape ready for consumption.
 */
export const prepareAccounts = ( accounts ) => {
	accounts = convertToCamelCase( accounts );
	if ( isArray( accounts ) ) {
		accounts = groupByProviderAndDomain( accounts );
	}
	return accounts;
};
