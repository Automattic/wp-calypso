import { isEnabled } from '@automattic/calypso-config';
import { get } from 'lodash';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { sitesDashboard } from './controller';

export default function () {
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = get( site, 'ID' );
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );
	if ( ! isEnabled( 'build/sites-dashboard' ) ) {
		page( '/sites', siteSelection, sites, makeLayout, clientRender );
	} else {
		page( '/sites', sitesDashboard, makeLayout, clientRender );
	}
}
