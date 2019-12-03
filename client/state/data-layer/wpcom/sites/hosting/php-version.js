/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOSTING_PHP_VERSION_SET, HOSTING_PHP_VERSION_SET_SUCCESS } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import {
	withAnalytics,
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'state/analytics/actions';

const updateNoticeId = 'hosting-php-version';

const updatePhpVersion = action =>
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
			'Clicked "Update PHP Version" Button in PHP Version box',
			`PHP Version Update ${ result }`,
			version
		),
		recordTracksEvent( 'calypso_hosting_configuration_php_version_update', {
			result,
			version,
		} )
	);

const updatePhpVersionSuccess = action => {
	return [
		{
			type: HOSTING_PHP_VERSION_SET_SUCCESS,
			version: action.version,
		},
		withAnalytics(
			hostingPhpVersionUpdateTracking( action.version, true ),
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
			)
		),
	];
};

const updatePhpVersionError = action => {
	return withAnalytics(
		hostingPhpVersionUpdateTracking( action.version, false ),
		errorNotice( translate( 'Failed to set PHP version.' ), {
			id: updateNoticeId,
		} )
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/php-version.js', {
	[ HOSTING_PHP_VERSION_SET ]: [
		dispatchRequest( {
			fetch: updatePhpVersion,
			onSuccess: updatePhpVersionSuccess,
			onError: updatePhpVersionError,
		} ),
	],
} );
