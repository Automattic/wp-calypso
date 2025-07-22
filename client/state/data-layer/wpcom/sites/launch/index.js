import { translate } from 'i18n-calypso';
import { SITE_LAUNCH } from 'calypso/state/action-types';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { updateSiteSettings } from 'calypso/state/site-settings/actions';
import { receiveSite } from 'calypso/state/sites/actions';
import { launchSiteFailure, launchSiteSuccess } from 'calypso/state/sites/launch/actions';

const handleLaunchSiteRequest = dispatchRequest( {
	fetch: ( action ) => [
		// TODO: reenable this notice after bringing the celebratory notice to this file
		// infoNotice( translate( 'Launching your site…' ), { duration: 1000 } ),
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
		() => {
			console.log( '### lets handle this with the main success celebration!' );
		},
		// successNotice(
		// 	translate( 'Your site has been launched; now you can share it with the world!' ),
		// 	{
		// 		duration: 5000,
		// 	}
		// ),
		launchSiteSuccess( data.ID ),
	],
	onError: ( action, data ) => {
		return [ errorNotice( data.message, { duration: 5000 } ), launchSiteFailure( action.siteId ) ];
	},
} );

registerHandlers( 'state/data-layer/wpcom/sites/launch/index.js', {
	[ SITE_LAUNCH ]: [ handleLaunchSiteRequest ],
} );
