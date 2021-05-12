/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { SITE_LAUNCH } from 'calypso/state/action-types';
import { receiveSite } from 'calypso/state/sites/actions';
import { updateSiteSettings } from 'calypso/state/site-settings/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';

const handleLaunchSiteRequest = dispatchRequest( {
	fetch: ( action ) => [
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
		requestSiteChecklist( data.ID ),
		requestEligibility( data.ID ),
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
