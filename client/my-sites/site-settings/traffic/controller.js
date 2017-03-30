/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import TrafficMain from 'my-sites/site-settings/traffic/main';
import sitesFactory from 'lib/sites-list';
import utils from 'lib/site/utils';

const sites = sitesFactory();

export default {
	traffic(context, next) {
	    const analyticsPageTitle = 'Site Settings > Traffic';
		const basePath = route.sectionify( context.path );
		const fiveMinutes = 5 * 60 * 1000;
		let site = sites.getSelectedSite();

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

		context.primary = React.createElement( TrafficMain, {
			...{ sites, upgradeToBusiness }
		} );

		// analytics tracking
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
		next();
	}
};
