import { subscribe, dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const MAX_NOTICES = 3;

/**
 * Limits the number of snackbars presented to the user.
 *
 * Subscribes to the notice store and removes any notices that exceed
 * our limit. Returns an unsubscribe function for consistency, but it
 * is expected that this store subscription will last for the life of
 * the dashboard.
 * @returns Unsubscribe function.
 */
export default function limitTotalSnackbars() {
	let isRemovingNotices = false;

	return subscribe( () => {
		if ( isRemovingNotices ) {
			return;
		}

		const idsToRemove = select( noticesStore )
			.getNotices()
			.filter( ( { type } ) => type === 'snackbar' )
			.slice( 0, -MAX_NOTICES )
			.map( ( n ) => n.id );

		try {
			isRemovingNotices = true;
			dispatch( noticesStore ).removeNotices( idsToRemove );
		} finally {
			isRemovingNotices = false;
		}
	}, noticesStore );
}
