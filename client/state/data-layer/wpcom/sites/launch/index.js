import { updateLaunchpadSettings } from '@automattic/data-stores';
import { translate } from 'i18n-calypso';
import { SITE_LAUNCH } from 'calypso/state/action-types';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, infoNotice } from 'calypso/state/notices/actions';
import { updateSiteSettings } from 'calypso/state/site-settings/actions';
import { receiveSite, requestSite } from 'calypso/state/sites/actions';
import {
	launchSiteFailure,
	launchSiteSuccess,
	launchSiteSuccessCelebration,
} from 'calypso/state/sites/launch/actions';

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
		requestSite( data.ID ),
		updateSiteSettings( data.ID, data.options ),
		requestSiteChecklist( data.ID ),
		requestEligibility( data.ID ),
		launchSiteSuccess( data.ID ),
		launchSiteSuccessCelebration( data.ID ),
		() => {
			if ( data.is_wpcom_atomic ) {
				updateLaunchpadSettings( data.slug, {
					checklist_statuses: { site_launched: true },
				} );
			}
		},
	],
	onError: ( action, data ) => {
		return [ errorNotice( data.message, { duration: 5000 } ), launchSiteFailure( action.siteId ) ];
	},
} );

registerHandlers( 'state/data-layer/wpcom/sites/launch/index.js', {
	[ SITE_LAUNCH ]: [ handleLaunchSiteRequest ],
} );
