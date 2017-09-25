/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import DeleteSite from './delete-site';
import ManageConnection from './manage-connection';
import StartOver from './start-over';
import ThemeSetup from './theme-setup';
import AsyncLoad from 'components/async-load';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import purchasesPaths from 'me/purchases/paths';
import SiteSettingsMain from 'my-sites/site-settings/main';
import { SITES_ONCE_CHANGED } from 'state/action-types';
import { canCurrentUser, isVipSite } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

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

	general( context ) {
		renderPage(
			context,
			<SiteSettingsMain />
		);
	},

	importSite( context ) {
		renderPage(
			context,
			<AsyncLoad require="my-sites/site-settings/section-import" />
		);
	},

	exportSite( context ) {
		renderPage(
			context,
			<AsyncLoad require="my-sites/site-settings/section-export" />
		);
	},

	guidedTransfer( context ) {
		renderPage(
			context,
			<AsyncLoad
				require="my-sites/guided-transfer"
				hostSlug={ context.params.host_slug }
			/>
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
			return page.redirect( '/settings/general/' + site.slug );
		}

		if ( ! config.isEnabled( 'settings/theme-setup' ) ) {
			return page.redirect( '/settings/general/' + site.slug );
		}

		renderPage(
			context,
			<ThemeSetup />
		);
	},

	manageConnection( context ) {
		renderPage(
			context,
			<ManageConnection />
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
};

export default controller;
