/**
 * External dependencies
 */

import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { getSiteBySlug, getSiteHomeUrl } from 'state/sites/selectors';
import { trackNavigationStart } from 'lib/performance-tracking';

export default function () {
	page( '/sites/:site', trackNavigationStart( 'sites' ), ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = get( site, 'ID' );
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );
	page( '/sites', trackNavigationStart( 'sites' ), siteSelection, sites, makeLayout, clientRender );
}
