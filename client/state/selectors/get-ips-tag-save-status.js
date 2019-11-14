/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a string indicating whether the status of a .uk transfer
 * IPS tag save.
 *
 * @param  {Object} state   Global state tree
 * @param  {string} domain  Domain
 * @return {string}         Transfer status
 */
export default function getIpsTagSaveStatus( state, domain ) {
	return get( state.domains.transfer, [ 'items', domain, 'saveStatus' ] );
}
