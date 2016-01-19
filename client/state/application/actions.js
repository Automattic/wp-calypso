/**
 * Internal dependencies
 */
import { CONNECTION_LOST, CONNECTION_RESTORED } from 'state/action-types';
import { warningNotice, successNotice, removeNotice } from 'state/notices/actions';
import i18n from 'lib/mixins/i18n';

export function connectionLost() {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionRestored' ) );
		dispatch( warningNotice(
			i18n.translate( 'Not connected. Some information may be out of sync.' )
			, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionLost',
				duration: 5000
			} )
		);
		dispatch( { type: CONNECTION_LOST } );
	};
}

export function connectionRestored() {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionLost' ) );
		dispatch( successNotice(
			i18n.translate( 'Connection restored.' )
			, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionRestored',
				duration: 5000
			} )
		);
		dispatch( { type: CONNECTION_RESTORED } );
	};
}
