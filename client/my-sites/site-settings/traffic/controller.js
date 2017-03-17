/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import TrafficMain from 'my-sites/site-settings/traffic/main';
import sitesFactory from 'lib/sites-list';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import utils from 'lib/site/utils';

const sites = sitesFactory();

export default {
	traffic( context ) {
		const analyticsPageTitle = 'Site Settings > SEO';
		const basePath = route.sectionify( context.path );
		const fiveMinutes = 5 * 60 * 1000;
		let site = sites.getSelectedSite();

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Site Settings', { textOnly: true } ) ) );

		// if site loaded, but user cannot manage site, redirect
		if ( site && ! utils.userCan( 'manage_options', site ) ) {
			page.redirect( '/stats' );
			return;
		}

		if ( ! site.latestSettings || new Date().getTime() - site.latestSettings > ( fiveMinutes ) ) {
			if ( sites.initialized ) {
				site.fetchSettings();
			} else {
				sites.once( 'change', function() {
					site = sites.getSelectedSite();
					site.fetchSettings();
				} );
			}
		}

		const upgradeToBusiness = () => page( '/checkout/' + site.domain + '/business' );

		renderWithReduxStore(
			React.createElement( TrafficMain, {
				...{ sites, upgradeToBusiness }
			} ),
			document.getElementById( 'primary' ),
			context.store
		);

		// analytics tracking
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	}
};
