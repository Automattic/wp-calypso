/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import config from 'config';
import DeleteSite from './delete-site';
import ConfirmDisconnection from './disconnect-site/confirm';
import DisconnectSite from './disconnect-site';
import { billingHistory } from 'me/purchases/paths';
import SiteSettingsMain from 'my-sites/site-settings/main';
import StartOver from './start-over';
import ThemeSetup from './theme-setup';
import ManageConnection from './manage-connection';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isVipSite from 'state/selectors/is-vip-site';
import { setSection } from 'state/ui/actions';

function canDeleteSite( state, siteId ) {
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	if ( ! siteId || ! canManageOptions ) {
		// Current user doesn't have manage options to delete the site
		return false;
	}

	if ( isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId ) ) {
		// Current user can't delete a Jetpack site, but can request to delete an Atomic site
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		// Current user can't delete a VIP site
		return false;
	}

	return true;
}

export function redirectIfCantDeleteSite( context, next ) {
	const state = context.store.getState();

	if ( ! canDeleteSite( state, getSelectedSiteId( state ) ) ) {
		return page.redirect( '/settings/general/' + getSelectedSiteSlug( state ) );
	}

	next();
}

export function general( context, next ) {
	context.primary = <SiteSettingsMain />;
	next();
}

export function deleteSite( context, next ) {
	context.primary = <DeleteSite path={ context.path } />;

	next();
}

export function disconnectSite( context, next ) {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );
	context.primary = <DisconnectSite reason={ context.params.reason } />;
	next();
}

export function disconnectSiteConfirm( context, next ) {
	const { reason, text } = context.query;
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );
	context.primary = <ConfirmDisconnection reason={ reason } text={ text } />;
	next();
}

export function startOver( context, next ) {
	context.primary = <StartOver path={ context.path } />;
	next();
}

export function themeSetup( context, next ) {
	const site = getSelectedSite( context.store.getState() );
	if ( site && site.jetpack ) {
		return page.redirect( '/settings/general/' + site.slug );
	}

	if ( ! config.isEnabled( 'settings/theme-setup' ) ) {
		return page.redirect( '/settings/general/' + site.slug );
	}

	context.primary = <ThemeSetup />;
	next();
}

export function manageConnection( context, next ) {
	context.primary = <ManageConnection />;
	next();
}

export function legacyRedirects( context, next ) {
	const { section } = context.params;
	const redirectMap = {
		account: '/me/account',
		password: '/me/security',
		'public-profile': '/me/public-profile',
		notifications: '/me/notifications',
		disbursements: '/me/public-profile',
		earnings: '/me/public-profile',
		'billing-history': billingHistory,
		'billing-history-v2': billingHistory,
		'connected-apps': '/me/security/connected-applications',
	};

	if ( redirectMap[ section ] ) {
		return page.redirect( redirectMap[ section ] );
	}

	next();
}

export function redirectToTraffic( context ) {
	return page.redirect( '/marketing/traffic/' + context.params.site_id );
}
