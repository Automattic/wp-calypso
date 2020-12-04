/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * Return a string indicating whether the status of a .uk transfer
 * IPS tag save.
 *
 * @param  {object} state   Global state tree
 * @param  {string} domain  Domain
 * @returns {string}         Transfer status
 */
export default function getIpsTagSaveStatus( state, domain ) {
	return get( state.domains.transfer, [ 'items', domain, 'saveStatus' ] );
}
