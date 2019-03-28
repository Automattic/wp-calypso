/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';
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
import { SITES_ONCE_CHANGED } from 'state/action-types';
import { setSection } from 'state/ui/actions';
import { setImportingFromSignupFlow, setImportOriginSiteDetails } from 'state/importer-nux/actions';
import { decodeURIComponentIfValid } from 'lib/url';

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

export function redirectToGeneral() {
	page.redirect( '/settings/general' );
}

export function redirectIfCantDeleteSite( context, next ) {
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
			},
		} );
	}
	next();
}

export function general( context, next ) {
	context.primary = <SiteSettingsMain />;
	next();
}

export function importSite( context, next ) {
	// Pull supported query arguments into state & discard the rest
	if ( context.querystring ) {
		page.replace( context.pathname, {
			engine: get( context, 'query.engine' ),
			isFromSignup: get( context, 'query.signup' ),
			siteUrl: get( context, 'query.from-site' ),
		} );
		return;
	}

	context.store.dispatch(
		setImportOriginSiteDetails( {
			engine: get( context, 'state.engine' ),
			siteUrl: decodeURIComponentIfValid( get( context, 'state.siteUrl' ) ),
		} )
	);

	if ( get( context, 'state.isFromSignup' ) ) {
		context.store.dispatch( setImportingFromSignupFlow() );
	}

	context.primary = <AsyncLoad require="my-sites/site-settings/section-import" />;
	next();
}

export function exportSite( context, next ) {
	context.primary = <AsyncLoad require="my-sites/site-settings/section-export" />;
	next();
}

export function guidedTransfer( context, next ) {
	context.primary = (
		<AsyncLoad require="my-sites/guided-transfer" hostSlug={ context.params.host_slug } />
	);
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
	const section = context.params.section,
		redirectMap = {
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
	if ( ! context ) {
		return page( '/me/public-profile' );
	}
	if ( redirectMap[ section ] ) {
		return page.redirect( redirectMap[ section ] );
	}
	next();
}
