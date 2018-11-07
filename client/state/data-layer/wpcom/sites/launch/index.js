/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { SITE_LAUNCH } from 'state/action-types';
import { receiveSite } from 'state/sites/actions';
import { updateSiteSettings } from 'state/site-settings/actions';
import { errorNotice, infoNotice, successNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const handleLaunchSiteRequest = dispatchRequestEx( {
	fetch: action => [
		infoNotice( translate( 'Launching your site…' ), { duration: 1000 } ),
		http(
			{
				method: 'POST',
				path: `/sites/${ action.siteId }/launch`,
			},
			action
		),
	],
	onSuccess: ( action, data ) => [
		receiveSite( data ),
		updateSiteSettings( data.ID, data.options ),
		successNotice(
			translate( 'Your site has been launched; now you can share it with the world!' ),
			{
				duration: 5000,
			}
		),
	],
	onError: ( action, data ) => errorNotice( data.message, { duration: 5000 } ),
} );

registerHandlers( 'state/data-layer/wpcom/sites/launch/index.js', {
	[ SITE_LAUNCH ]: [ handleLaunchSiteRequest ],
} );
