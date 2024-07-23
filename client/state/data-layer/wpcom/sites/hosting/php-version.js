import { translate } from 'i18n-calypso';
import {
	HOSTING_PHP_VERSION_REQUEST,
	HOSTING_PHP_VERSION_SET_REQUEST,
	HOSTING_PHP_VERSION_SET,
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

const updateNoticeId = 'hosting-php-version';

const getPhpVersion = async ( action ) => {
	return await http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/php-version`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);
};

const getPhpVersionSuccess = ( action, version ) => {
	return {
		type: HOSTING_PHP_VERSION_SET,
		siteId: action.siteId,
		version,
	};
};

const updatePhpVersion = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/php-version`,
			apiNamespace: 'wpcom/v2',
			body: {
				version: action.version,
			},
		},
		action
	);

export const hostingPhpVersionUpdateTracking = ( version, result ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Hosting Configuration',
			'Clicked "Update PHP Version" Button in Web Server Settings box',
			`PHP Version Update ${ result }`,
			version
		),
		recordTracksEvent( 'calypso_hosting_configuration_php_version_update', {
			result,
			version,
		} )
	);

const updatePhpVersionSuccess = ( action ) => {
	return [
		hostingPhpVersionUpdateTracking( action.version, true ),
		{
			type: HOSTING_PHP_VERSION_SET,
			siteId: action.siteId,
			version: action.version,
		},
		successNotice(
			translate( 'PHP version successfully set to %(version)s.', {
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

const updatePhpVersionError = ( action ) => {
	return [
		hostingPhpVersionUpdateTracking( action.version, false ),
		errorNotice( translate( 'Failed to set PHP version.' ), {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/php-version.js', {
	[ HOSTING_PHP_VERSION_SET_REQUEST ]: [
		dispatchRequest( {
			fetch: updatePhpVersion,
			onSuccess: updatePhpVersionSuccess,
			onError: updatePhpVersionError,
		} ),
	],
	[ HOSTING_PHP_VERSION_REQUEST ]: [
		dispatchRequest( {
			fetch: getPhpVersion,
			onSuccess: getPhpVersionSuccess,
		} ),
	],
} );
