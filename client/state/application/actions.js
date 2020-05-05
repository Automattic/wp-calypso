/**
 * Internal dependencies
 */

import { CONNECTION_LOST, CONNECTION_RESTORED } from 'state/action-types';

import { warningNotice, successNotice, removeNotice } from 'state/notices/actions';

export function connectionLost( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionRestored' ) );
		dispatch(
			warningNotice( noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionLost',
				duration: 5000,
			} )
		);
		dispatch( { type: CONNECTION_LOST } );
	};
}

export function connectionRestored( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionLost' ) );
		dispatch(
			successNotice( noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionRestored',
				duration: 5000,
			} )
		);
		dispatch( { type: CONNECTION_RESTORED } );
	};
}
