/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import TrafficMain from 'my-sites/site-settings/traffic/main';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUser } from 'state/selectors';

export default {
	traffic( context ) {
		const analyticsPageTitle = 'Site Settings > Traffic';
		const basePath = route.sectionify( context.path );
		const state = context.store.getState();
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

		// if site loaded, but user cannot manage site, redirect
		if ( site && ! canManageOptions ) {
			page.redirect( '/stats' );
			return;
		}

		const upgradeToBusiness = () => page( '/checkout/' + site.domain + '/business' );

		renderWithReduxStore(
			React.createElement( TrafficMain, {
				...{ upgradeToBusiness }
			} ),
			document.getElementById( 'primary' ),
			context.store
		);

		// analytics tracking
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	}
};
