/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOSTING_RESTORE_WP_CONFIG } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

const requestRestoreWpConfig = action =>
	http(
		{
			path: `/sites/${ action.siteId }/hosting/restore-wp-config`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const showRestoreWpConfigSuccessNotice = () => {
	return successNotice( translate( 'The wp-config.php file has been restored.' ), {
		duration: 5000,
	} );
};

const showRestoreWpConfigErrorNotice = () => {
	return errorNotice(
		translate( 'Sorry, we had a problem restoring the wp-config.php file. Please try again.' ),
		{
			duration: 5000,
		}
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/restore-wp-config.js', {
	[ HOSTING_RESTORE_WP_CONFIG ]: [
		dispatchRequest( {
			fetch: requestRestoreWpConfig,
			onSuccess: showRestoreWpConfigSuccessNotice,
			onError: showRestoreWpConfigErrorNotice,
		} ),
	],
} );
