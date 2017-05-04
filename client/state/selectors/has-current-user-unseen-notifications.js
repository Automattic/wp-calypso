/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

export default function hasCurrentUserUnseenNotifications( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'has_unseen_notes', false );
};
