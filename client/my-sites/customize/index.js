import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { getCustomizerUrl, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function () {
	page( '/customize/:panel([^.]+)?', siteSelection, sites, makeLayout, clientRender );
	page(
		'/customize/:panel?/:domain',
		siteSelection,
		navigation,
		( context ) => {
			const { getState } = context.store;
			const { panel } = context.params;
			const state = getState();
			const siteId = getSelectedSiteId( state );

			if ( siteId ) {
				const adminUrl = getSiteAdminUrl( state, siteId, '' );
				const customizerUrl = getCustomizerUrl( state, siteId, panel || null, adminUrl );

				if ( customizerUrl ) {
					window.location.href = customizerUrl;
					return;
				}
			}
		},
		makeLayout,
		clientRender
	);
}
