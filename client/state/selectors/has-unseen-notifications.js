/**
 * Internal dependencies
 */

import getUnseenCount from 'state/selectors/get-notification-unseen-count';
import { getCurrentUser } from 'state/current-user/selectors';

// Named export `hasUnseenNotifications` is for testing purposes only!
// We want to use the `getUser` mock as we want to avoid testing the state system of `getUser` AND of the unseen count.
// Complete thread: https://github.com/Automattic/wp-calypso/pull/26491#pullrequestreview-145316736
export const hasUnseenNotifications = ( getUser ) => ( state ) => {
	const unseenCount = getUnseenCount( state );
	if ( null !== unseenCount ) {
		return unseenCount > 0;
	}

	const user = getUser( state );
	if ( null !== user ) {
		return !! user.has_unseen_notes;
	}

	return null;
};

// export default with getCurrentUser from state
export default hasUnseenNotifications( getCurrentUser );
