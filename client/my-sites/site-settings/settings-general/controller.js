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
import GeneralMain from 'my-sites/site-settings/settings-general/main';
import DeleteSite from 'my-sites/site-settings/delete-site';
import StartOver from 'my-sites/site-settings/start-over';
import ThemeSetup from 'my-sites/site-settings/theme-setup';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser, isVipSite } from 'state/selectors';
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
	general( context ) {
		renderWithReduxStore(
			React.createElement( GeneralMain ),
			document.getElementById( 'primary' ),
			context.store
		);
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

	deleteSite( context ) {
		controller.redirectIfCantDeleteSite( context );

		renderPage(
			context,
			<DeleteSite path={ context.path } />
		);
	},

	startOver( context ) {
		controller.redirectIfCantDeleteSite( context );

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
};

export default controller;
