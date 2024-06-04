import { get } from 'lodash';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's is_subscription_only_user state.
 * @param  {Object}  state Global state tree
 * @returns {?boolean}       The current user's is_subscription_only_user state
 */
export default function getIsSubscriptionOnlyUser( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'is_subscription_only_user', null );
}
