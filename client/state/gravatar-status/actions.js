import { GRAVATAR_UPLOAD_REQUEST, GRAVATAR_DETAILS_RECEIVE } from 'calypso/state/action-types';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import 'calypso/state/gravatar-status/init';
import 'calypso/state/data-layer/wpcom/gravatar-upload';

export function uploadGravatar( file, email ) {
	return withAnalytics( recordTracksEvent( 'calypso_edit_gravatar_upload_start' ), {
		type: GRAVATAR_UPLOAD_REQUEST,
		file,
		email,
	} );
}

export function receiveGravatarDetails( gravatarDetails ) {
	return {
		type: GRAVATAR_DETAILS_RECEIVE,
		gravatarDetails,
	};
}
