import { translate } from 'i18n-calypso';
import {
	HOSTING_WP_VERSION_REQUEST,
	HOSTING_WP_VERSION_SET_REQUEST,
	HOSTING_WP_VERSION_SET,
} from 'calypso/state/action-types';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const updateNoticeId = 'hosting-wp-version';

const getWpVersion = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/wp-version1`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);
};
const getWpVersionSuccess = ( action, version ) => {
	return {
		type: HOSTING_WP_VERSION_SET,
		siteId: action.siteId,
		version,
	};
};

const updateWpVersion = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/wp-version`,
			apiNamespace: 'wpcom/v2',
			body: {
				version: action.version,
			},
		},
		action
	);

export const hostingWpVersionUpdateTracking = ( version, result ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_hosting_configuration_wp_version_update', {
			result,
			version,
		} )
	);

const updateWpVersionSuccess = ( action ) => {
	return [
		hostingWpVersionUpdateTracking( action.version, true ),
		{
			type: HOSTING_WP_VERSION_SET,
			siteId: action.siteId,
			version: action.version,
		},
		successNotice(
			translate( 'WordPress version successfully set to %(version)s.', {
				args: {
					version: action.version,
				},
			} ),
			{
				id: updateNoticeId,
				showDismiss: false,
				duration: 5000,
			}
		),
	];
};

const updateWpVersionError = ( action ) => {
	return [
		hostingWpVersionUpdateTracking( action.version, false ),
		errorNotice( translate( 'Failed to set WordPress version.' ), {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/wp-version.js', {
	[ HOSTING_WP_VERSION_SET_REQUEST ]: [
		dispatchRequest( {
			fetch: updateWpVersion,
			onSuccess: updateWpVersionSuccess,
			onError: updateWpVersionError,
		} ),
	],
	[ HOSTING_WP_VERSION_REQUEST ]: [
		dispatchRequest( {
			fetch: getWpVersion,
			onSuccess: getWpVersionSuccess,
		} ),
	],
} );
