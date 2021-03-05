/**
 * Internal dependencies
 */
import 'calypso/state/memberships/init';

export function getAllSubscriptions( state ) {
	return state.memberships?.subscriptions?.items || [];
}

export function getSubscription( state, subscriptionId ) {
	return getAllSubscriptions( state )
		.filter( ( sub ) => sub.ID === subscriptionId )
		.pop();
}

export function getStoppingStatus( state, subscriptionId ) {
	return state?.memberships?.subscriptions?.stoppingSubscription[ subscriptionId ] || false;
}
