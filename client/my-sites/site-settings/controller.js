/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import DeleteSite from './delete-site';
import purchasesPaths from 'me/purchases/paths';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import { sectionify } from 'lib/route/path';
import SiteSettingsComponent from 'my-sites/site-settings/main';
import sitesFactory from 'lib/sites-list';
import StartOver from './start-over';
import ThemeSetup from './theme-setup';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import titlecase from 'to-title-case';
import utils from 'lib/site/utils';

/**
 * Module vars
 */
const sites = sitesFactory();

function canDeleteSite( site ) {
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
}

function renderPage( context, component ) {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
}

module.exports = {
	redirectToGeneral() {
		page.redirect( '/settings/general' );
	},

	siteSettings( context ) {
		let analyticsPageTitle = 'Site Settings';
		const basePath = route.sectionify( context.path );
		const fiveMinutes = 5 * 60 * 1000;
		let site = sites.getSelectedSite();
		const section = sectionify( context.path ).split( '/' )[ 2 ];

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Site Settings', { textOnly: true } ) ) );

		// if site loaded, but user cannot manage site, redirect
		if ( site && ! utils.userCan( 'manage_options', site ) ) {
			page.redirect( '/stats' );
			return;
		}

		// if user went directly to jetpack settings page, redirect
		if ( site.jetpack && ! config.isEnabled( 'manage/jetpack' ) ) {
			window.location.href = '//wordpress.com/manage/' + site.ID;
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

		renderPage(
			context,
			<SiteSettingsComponent { ...{ sites, section, upgradeToBusiness } } />
		);

		// analytics tracking
		if ( 'undefined' !== typeof section ) {
			analyticsPageTitle += ' > ' + titlecase( section );
		}
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	},

	importSite( context ) {
		renderPage(
			context,
			<SiteSettingsComponent sites={ sites } section="import" />
		);
	},

	exportSite( context ) {
		renderPage(
			context,
			<SiteSettingsComponent sites={ sites } section="export" />
		);
	},

	guidedTransfer( context ) {
		renderPage(
			context,
			<SiteSettingsComponent sites={ sites } section="guidedTransfer" hostSlug={ context.params.host_slug } />
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

	legacyRedirects( context, next ) {
		const section = context.params.section,
			redirectMap = {
				account: '/me/account',
				password: '/me/security',
				'public-profile': '/me/public-profile',
				notifications: '/me/notifications',
				disbursements: '/me/public-profile',
				earnings: '/me/public-profile',
				'billing-history': purchasesPaths.billingHistory(),
				'billing-history-v2': purchasesPaths.billingHistory(),
				'connected-apps': '/me/security/connected-applications'
			};
		if ( ! context ) {
			return page( '/me/public-profile' );
		}
		if ( redirectMap[ section ] ) {
			return page.redirect( redirectMap[ section ] );
		}
		next();
	},

	setScroll( context, next ) {
		window.scroll( 0, 0 );
		next();
	}

};
