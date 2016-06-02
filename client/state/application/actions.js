/**
 * Internal dependencies
 */
import { 
	CONNECTION_LOST, 
	CONNECTION_RESTORED, 
	CSS_BUILD_FAILED, 
	CSS_BUILDING 
} from 'state/action-types';

import { 
	warningNotice, 
	successNotice, 
	removeNotice, 
	errorNotice, 
	infoNotice 
} from 'state/notices/actions';

export function connectionLost( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionRestored' ) );
		dispatch( warningNotice(
			noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionLost',
				duration: 5000
			} )
		);
		dispatch( { type: CONNECTION_LOST } );
	};
}

export function connectionRestored( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'connectionLost' ) );
		dispatch( successNotice(
			noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionRestored',
				duration: 5000
			} )
		);
		dispatch( { type: CONNECTION_RESTORED } );
	};
}

export function cssBuildFailed( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'cssBuilding' ) );
		dispatch( errorNotice(
			noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'cssBuildFailed',
				duration: 5000
			} )
		);
		dispatch( { type: CSS_BUILD_FAILED } );
	};
}

export function cssBuilding( noticeText ) {
	return ( dispatch ) => {
		dispatch( removeNotice( 'cssBuildFailed' ) );
		dispatch( infoNotice(
			noticeText, {
				showDismiss: true,
				isPersistent: true,
				id: 'cssBuilding',
				duration: 5000
			} )
		);
		dispatch( { type: CSS_BUILDING } );
	};
}

