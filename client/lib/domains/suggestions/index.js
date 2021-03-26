/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { getDomainSuggestionsVendor } from '@automattic/domain-picker';

/**
 * Get the suggestions vendor
 *
 * @param {object} [options={}] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup=false] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly=false] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium=false] Flag to show premium domains.
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( options = {} ) => {
	// If the isPremium prop is not given, fallback to the value set in config.
	if ( typeof options.isPremium === 'undefined' ) {
		options.isPremium = config.isEnabled( 'domains/premium-domain-purchases' );
	}

	return getDomainSuggestionsVendor( options );
};
