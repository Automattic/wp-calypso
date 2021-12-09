import 'calypso/state/help/init';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

/**
 * Returns tickets from the current user's support history which are still in
 * an active status.
 *
 * @param  {object}  state   Global state tree
 * @returns {Array} Active tickets
 */
export function getActiveSupportTickets( state ) {
	return state.help.supportHistory.filter(
		( item ) => item.type === 'Zendesk_History' && ACTIVE_STATUSES.includes( item.status )
	);
}

export function getActiveSupportTicketCount( state ) {
	return getActiveSupportTickets( state ).length;
}
