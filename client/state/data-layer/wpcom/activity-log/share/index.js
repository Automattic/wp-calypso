/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { REWIND_ACTIVITY_SHARE_REQUEST } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

const requestShare = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/activity/${ action.rewindId }/share`,
			body: { email: action.email },
		},
		action
	);

const successfulShare = ( { siteId, rewindId } ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_activity_event_share_success', {
			site_id: siteId,
			rewind_id: rewindId,
		} ),
		successNotice( translate( "We've shared the event!" ) )
	);

const failedShare = ( { siteId, rewindId } ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_activity_event_share_failed', {
			site_id: siteId,
			rewind_id: rewindId,
		} ),
		errorNotice( translate( 'The event failed to send, please try again.' ) )
	);

registerHandlers( 'state/data-layer/wpcom/activity-log/share/index.js', {
	[ REWIND_ACTIVITY_SHARE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestShare,
			onSuccess: successfulShare,
			onError: failedShare,
		} ),
	],
} );
