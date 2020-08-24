/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOSTING_CLEAR_CACHE_REQUEST } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

const updateNoticeId = 'hosting-clear-wordpress-cache';

const clearWordPressCache = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/clear-cache`,
			apiNamespace: 'wpcom/v2',
			body: {
				reason: action.reason,
			},
		},
		action
	);

export const hostingClearWordPressCacheTracking = ( result ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Hosting Configuration',
			'Clicked "Clear WordPress Cache" Button in Miscellaneous box',
			`Clear WordPress Cache`,
			result
		),
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', { result } )
	);

const clearWordPressCacheSuccess = () => {
	return [
		hostingClearWordPressCacheTracking( true ),
		successNotice( translate( 'Successfully cleared WordPress cache.' ), {
			id: updateNoticeId,
			showDismiss: false,
			duration: 5000,
		} ),
	];
};

const clearWordPressCacheError = () => {
	return [
		hostingClearWordPressCacheTracking( false ),
		errorNotice( translate( 'Failed to clear WordPress cache.' ), {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/clear-cache.js', {
	[ HOSTING_CLEAR_CACHE_REQUEST ]: [
		dispatchRequest( {
			fetch: clearWordPressCache,
			onSuccess: clearWordPressCacheSuccess,
			onError: clearWordPressCacheError,
		} ),
	],
} );
