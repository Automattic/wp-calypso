import { translate } from 'i18n-calypso';
import {
	HOSTING_STATIC_FILE_404_REQUEST,
	HOSTING_STATIC_FILE_404_SET_REQUEST,
	HOSTING_STATIC_FILE_404_SET,
} from 'calypso/state/action-types';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const updateNoticeId = 'hosting-static-file-404';

const getStaticFile404 = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/static-file-404`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const getStaticFile404Success = ( action, setting ) => {
	return {
		type: HOSTING_STATIC_FILE_404_SET,
		siteId: action.siteId,
		setting,
	};
};

const updateStaticFile404 = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/static-file-404`,
			apiNamespace: 'wpcom/v2',
			body: {
				setting: action.setting,
			},
		},
		action
	);

export const hostingStaticFile404UpdateTracking = ( setting, result ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Hosting Configuration',
			'Clicked "Update Handling for Nonexistent Assets" Button in Web Server Settings box',
			`Static File 404 Update ${ result }`,
			setting
		),
		recordTracksEvent( 'calypso_hosting_configuration_static_file_404_update', {
			result,
			setting,
		} )
	);

const updateStaticFile404Success = ( action ) => {
	return [
		hostingStaticFile404UpdateTracking( action.setting, true ),
		{
			type: HOSTING_STATIC_FILE_404_SET,
			siteId: action.siteId,
			setting: action.setting,
		},
		successNotice(
			translate( 'Successfully updated handling for nonexistent assets.', {
				comment: 'Assets are images, fonts, JavaScript, and CSS files.',
			} ),
			{
				id: updateNoticeId,
				showDismiss: false,
				duration: 5000,
			}
		),
	];
};

const updateStaticFile404Error = ( action ) => {
	return [
		hostingStaticFile404UpdateTracking( action.setting, false ),
		errorNotice( translate( 'Failed to update handling for nonexistent assets.' ), {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/static-file-404.js', {
	[ HOSTING_STATIC_FILE_404_SET_REQUEST ]: [
		dispatchRequest( {
			fetch: updateStaticFile404,
			onSuccess: updateStaticFile404Success,
			onError: updateStaticFile404Error,
		} ),
	],
	[ HOSTING_STATIC_FILE_404_REQUEST ]: [
		dispatchRequest( {
			fetch: getStaticFile404,
			onSuccess: getStaticFile404Success,
		} ),
	],
} );
