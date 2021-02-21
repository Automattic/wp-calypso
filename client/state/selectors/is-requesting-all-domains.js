/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { allDomains } from 'calypso/state/all-domains/init';

/**
 * Determines whether the list of domains is being requested.
 *
 * @param {object} state - global state tree
 * @returns {?boolean} true if the list is being requested, false otherwise
 */
export default function isRequestingAllDomains( state ) {
	return get( state, [ allDomains, 'requesting' ], false );
}
