/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import SiteSettingsGeneral from 'my-sites/site-settings/general/main';
import DeleteSite from 'my-sites/site-settings/delete-site';
import StartOver from 'my-sites/site-settings/start-over';
import ThemeSetup from 'my-sites/site-settings/theme-setup';
import DateTimeFormat from 'my-sites/site-settings/date-time-format';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

const canDeleteSite = ( site ) => {
	if ( ! site.capabilities || ! site.capabilities.manage_options ) {
		// Current user doesn't have manage options to delete the site
		return false;
	}

	// Current user can't delete a jetpack site
	if ( site.jetpack ) {
		return false;
	}

	if ( site.is_vip ) {
		// Current user can't delete a VIP site
		return false;
	}

	return true;
};

const renderPage = ( context, component ) => {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
};

export default {
	general( context ) {
		const site = sites.getSelectedSite();

		renderPage(
			context,
			<SiteSettingsGeneral site={ site } />
		);
	},

	deleteSite( context ) {
		let site = sites.getSelectedSite();

		if ( sites.initialized ) {
			if ( ! canDeleteSite( site ) ) {
				return page( '/settings/general/' + site.slug );
			}
		} else {
			sites.once( 'change', function() {
				site = sites.getSelectedSite();
				if ( ! canDeleteSite( site ) ) {
					return page( '/settings/general/' + site.slug );
				}
			} );
		}

		renderPage(
			context,
			<DeleteSite sites={ sites } path={ context.path } />
		);
	},

	startOver( context ) {
		let site = sites.getSelectedSite();

		if ( sites.initialized ) {
			if ( ! canDeleteSite( site ) ) {
				return page( '/settings/general/' + site.slug );
			}
		} else {
			sites.once( 'change', function() {
				site = sites.getSelectedSite();
				if ( ! canDeleteSite( site ) ) {
					return page( '/settings/general/' + site.slug );
				}
			} );
		}

		renderPage(
			context,
			<StartOver path={ context.path } />
		);
	},

	themeSetup( context ) {
		let site = sites.getSelectedSite();

		if ( sites.initialized ) {
			if ( site.jetpack ) {
				return page( '/settings/general/' + site.slug );
			}
		} else {
			sites.once( 'change', function() {
				site = sites.getSelectedSite();
				if ( site.jetpack ) {
					return page( '/settings/general/' + site.slug );
				}
			} );
		}

		if ( ! config.isEnabled( 'settings/theme-setup' ) ) {
			return page( '/settings/general/' + site.slug );
		}

		renderPage(
			context,
			<ThemeSetup activeSiteDomain={ context.params.site_id } />
		);
	},

	dateTimeFormat( context ) {
		renderPage(
			context,
			<DateTimeFormat />
		);
	},
};
