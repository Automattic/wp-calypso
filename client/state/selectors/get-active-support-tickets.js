/**
 * External dependencies
 */

import { get } from 'lodash';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

/**
 * Returns tickets from the current user's support history which are still in
 * an active status.
 *
 * @param  {object}  state   Global state tree
 * @returns {Array} Active tickets
 */
export default function getActiveSupportTickets( state ) {
	return get( state, 'help.supportHistory', [] ).filter(
		( item ) => item.type === 'Zendesk_History' && ACTIVE_STATUSES.includes( item.status )
	);
}
