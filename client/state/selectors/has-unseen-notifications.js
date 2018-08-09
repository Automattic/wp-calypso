/** @format */

/**
 * Internal dependencies
 */

import getUnseenCount from 'state/selectors/get-notification-unseen-count';
import { getCurrentUser } from 'state/current-user/selectors';

export const hasUnseenNotifications = getUser => state => {
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
