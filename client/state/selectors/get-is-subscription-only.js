import { get } from 'lodash';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's is_subscription_only state.
 * This tells us if a user is only subscribed to as a follower to a newsletter.
 * @param  {Object}  state Global state tree
 * @returns {?boolean}       The current user's is_subscription_only state
 */
export default function getIsSubscriptionOnly( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'is_subscription_only', null );
}
