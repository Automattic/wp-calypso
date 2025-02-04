import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { DOTCOM_MONITORING } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { redirectHomeIfIneligible, siteMonitoring } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/site-monitoring/:site', ( context: Context ) => {
			page.redirect( `/sites/tools/monitoring/${ context.params.site }` );
		} );
	} else {
		page(
			'/site-monitoring/:site',
			siteSelection,
			redirectToHostingPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoring,
			siteDashboard( DOTCOM_MONITORING ),
			makeLayout,
			clientRender
		);
	}
}
