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
import StartOver from './start-over';
import ThemeSetup from './theme-setup';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import titlecase from 'to-title-case';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser, isVipSite } from 'state/selectors';
import ImportSettings from './section-import';
import ExportSettings from './section-export';
import { SITES_ONCE_CHANGED } from 'state/action-types';

function canDeleteSite( state, siteId ) {
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	if ( ! siteId || ! canManageOptions ) {
		// Current user doesn't have manage options to delete the site
		return false;
	}

	if ( isJetpackSite( state, siteId ) ) {
		// Current user can't delete a jetpack site
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
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

const controller = {
	redirectToGeneral() {
		page.redirect( '/settings/general' );
	},

	redirectIfCantDeleteSite( context ) {
		const state = context.store.getState();
		const dispatch = context.store.dispatch;
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );

		if ( siteId && ! canDeleteSite( state, siteId ) ) {
			return page.redirect( '/settings/general/' + siteSlug );
		}

		if ( ! siteId ) {
			dispatch( {
				type: SITES_ONCE_CHANGED,
				listener: () => {
					const updatedState = context.store.getState();
					const updatedSiteId = getSelectedSiteId( updatedState );
					const updatedSiteSlug = getSelectedSiteSlug( updatedState );
					if ( ! canDeleteSite( updatedState, updatedSiteId ) ) {
						return page.redirect( '/settings/general/' + updatedSiteSlug );
					}
				}
			} );
		}
	},

	siteSettings( context ) {
		let analyticsPageTitle = 'Site Settings';
		const basePath = route.sectionify( context.path );
		const siteId = getSelectedSiteId( context.store.getState() );
		const section = sectionify( context.path ).split( '/' )[ 2 ];
		const state = context.store.getState();

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Site Settings', { textOnly: true } ) ) );

		// if site loaded, but user cannot manage site, redirect
		if ( siteId && ! canCurrentUser( state, siteId, 'manage_options' ) ) {
			page.redirect( '/stats' );
			return;
		}

		// if user went directly to jetpack settings page, redirect
		if ( isJetpackSite( state, siteId ) && ! config.isEnabled( 'manage/jetpack' ) ) {
			window.location.href = '//wordpress.com/manage/' + siteId;
			return;
		}

		renderPage(
			context,
			<SiteSettingsComponent section={ section } />
		);

		// analytics tracking
		if ( 'undefined' !== typeof section ) {
			analyticsPageTitle += ' > ' + titlecase( section );
		}
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	},

	importSite( context ) {
		renderPage( context, <ImportSettings /> );
	},

	exportSite( context ) {
		renderPage( context, <ExportSettings /> );
	},

	guidedTransfer( context ) {
		renderPage(
			context,
			<SiteSettingsComponent section="guidedTransfer" hostSlug={ context.params.host_slug } />
		);
	},

	deleteSite( context ) {
		const redirectIfCantDeleteSite = controller.redirectIfCantDeleteSite;

		redirectIfCantDeleteSite( context );

		renderPage(
			context,
			<DeleteSite path={ context.path } />
		);
	},

	startOver( context ) {
		const redirectIfCantDeleteSite = controller.redirectIfCantDeleteSite;

		redirectIfCantDeleteSite( context );

		renderPage(
			context,
			<StartOver path={ context.path } />
		);
	},

	themeSetup( context ) {
		const site = getSelectedSite( context.store.getState() );
		if ( site && site.jetpack ) {
			return page( '/settings/general/' + site.slug );
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

export default controller;

