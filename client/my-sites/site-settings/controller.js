import page from 'page';
import { billingHistory } from 'calypso/me/purchases/paths';
import SiteSettingsMain from 'calypso/my-sites/site-settings/main';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DeleteSite from './delete-site';
import DisconnectSite from './disconnect-site';
import ConfirmDisconnection from './disconnect-site/confirm';
import ManageConnection from './manage-connection';
import StartOver from './start-over';

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
	context.primary = <DisconnectSite reason={ context.params.reason } type={ context.query.type } />;
	next();
}

export function disconnectSiteConfirm( context, next ) {
	const { reason, type, text } = context.query;
	context.primary = <ConfirmDisconnection reason={ reason } type={ type } text={ text } />;
	next();
}

export function startOver( context, next ) {
	context.primary = <StartOver path={ context.path } queryParams={ context.query } />;
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

export function redirectToGeneral( context ) {
	const siteFragment = context.params.site_id ? `/${ context.params.site_id }` : '';
	return page.redirect( `/settings/general${ siteFragment }` );
}
