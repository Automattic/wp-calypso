/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import sitesFactory from 'lib/sites-list';
import route from 'lib/route';
import { renderWithReduxStore } from 'lib/react-helpers';
import config from 'config';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import SitePurchasesData from 'components/data/purchases/site-purchases';
import { SiteSettingsComponent } from 'my-sites/site-settings/main';
import DeleteSite from './delete-site';
import StartOver from './start-over';
import utils from 'lib/site/utils';
import titleActions from 'lib/screen-title/actions';

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

module.exports = {
	redirectToGeneral() {
		page.redirect( '/settings/general' );
	},

	siteSettings( context ) {
		let analyticsPageTitle = 'Site Settings';
		const basePath = route.sectionify( context.path );
		const fiveMinutes = 5 * 60 * 1000;
		let site = sites.getSelectedSite();
		const { section } = context.params;

		titleActions.setTitle( i18n.translate( 'Site Settings', { textOnly: true } ),
			{ siteID: route.getSiteFragment( context.path ) }
		);

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

		// redirect seo and analytics tabs to general for Jetpack sites
		if ( site.jetpack && ( section === 'seo' || section === 'analytics' ) ) {
			page.redirect( '/settings/general/' + site.slug );
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

		renderWithReduxStore(
			<SitePurchasesData>
				<SiteSettingsComponent
					context={ context }
					sites={ sites }
					section={ section }
					path={ context.path } />
			</SitePurchasesData>,
			document.getElementById( 'primary' ),
			context.store
		);

		// analytics tracking
		if ( 'undefined' !== typeof section ) {
			analyticsPageTitle += ' > ' + titlecase( section );
		}
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	},

	importSite( context ) {
		ReactDom.render(
			<SiteSettingsComponent
				context={ context }
				sites={ sites }
				section="import"
				path={ context.path } />,
			document.getElementById( 'primary' )
		);
	},

	exportSite( context ) {
		ReactDom.render(
			<SiteSettingsComponent
				context={ context }
				sites={ sites }
				section="export"
				path={ context.path } />,
			document.getElementById( 'primary' )
		);
	},

	guidedTransfer( context ) {
		ReactDom.render(
			<SiteSettingsComponent
				context={ context }
				sites={ sites }
				section="guidedTransfer"
				path={ context.path } />,
			document.getElementById( 'primary' )
		);
	},

	deleteSite( context ) {
		var site = sites.getSelectedSite();

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

		ReactDom.render(
			<SitePurchasesData>
				<DeleteSite
					context={ context }
					sites={ sites }
					path={ context.path } />
			</SitePurchasesData>,
			document.getElementById( 'primary' )
		);
	},

	startOver( context ) {
		var site = sites.getSelectedSite();

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

		ReactDom.render(
			<StartOver
				context={ context }
				sites={ sites }
				path={ context.path } />,
			document.getElementById( 'primary' )
		);
	},

	legacyRedirects( context, next ) {
		var section = context.params.section,
			redirectMap;
		if ( ! context ) {
			return page( '/me/public-profile' );
		}
		redirectMap = {
			account: '/me/account',
			password: '/me/security',
			'public-profile': '/me/public-profile',
			notifications: '/me/notifications',
			disbursements: '/me/public-profile',
			earnings: '/me/public-profile',
			'billing-history': '/me/billing',
			'billing-history-v2': '/me/billing',
			'connected-apps': '/me/security/connected-applications'
		};
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
