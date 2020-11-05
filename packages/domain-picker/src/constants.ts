/**
 * External dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';

export const PAID_DOMAINS_TO_SHOW = 5;
export const PAID_DOMAINS_TO_SHOW_EXPANDED = 10;

/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const DOMAIN_SEARCH_DEBOUNCE_INTERVAL = 300;

// TODO: Check domain suggestions store registration discrepancies
// (see https://github.com/Automattic/wp-calypso/issues/46869)
export const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	vendor: 'variation2_front',
} );

export const domainIsAvailableStatus = [ 'available', 'available_premium' ];
