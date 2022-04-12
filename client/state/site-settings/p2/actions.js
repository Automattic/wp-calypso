import wpcom from 'calypso/lib/wp';
import {
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
} from 'calypso/state/action-types';
import { updateSiteSettings } from 'calypso/state/site-settings/actions';
import { normalizeSettings } from 'calypso/state/site-settings/utils';
import { requestSite } from 'calypso/state/sites/actions';
import 'calypso/state/site-settings/init';
import 'calypso/state/ui/init';

export function saveP2SiteSettings( siteId, settings = {} ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_SETTINGS_SAVE,
			siteId,
		} );

		if ( typeof settings?.p2_preapproved_domains !== 'undefined' ) {
			saveP2PreapprovedDomainSettings( siteId, settings, dispatch );
		}
	};
}

function saveP2PreapprovedDomainSettings( siteId, settings = {}, dispatch ) {
	return wpcom.req
		.post(
			'/p2/preapproved-joining/settings',
			{
				global: true,
				apiNamespace: 'wpcom/v2',
			},
			{
				hub_id: siteId,
				role: settings?.p2_preapproved_domains?.role,
				domains: settings?.p2_preapproved_domains?.domains,
			}
		)
		.then( ( body ) => {
			dispatch(
				updateSiteSettings(
					siteId,
					normalizeSettings( {
						p2_preapproved_domains: {
							...body.settings,
						},
					} )
				)
			);
			dispatch( {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				siteId,
			} );
			dispatch( requestSite( siteId ) );
			return body;
		} )
		.catch( ( error ) => {
			dispatch( {
				type: SITE_SETTINGS_SAVE_FAILURE,
				siteId,
				error,
			} );

			return error;
		} );
}
