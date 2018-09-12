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

const controller = {
	redirectToGeneral() {
		page.redirect( '/settings/general' );
	},

	redirectIfCantDeleteSite( context, next ) {
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
	},

	general( context, next ) {
		context.primary = <SiteSettingsMain />;
		next();
	},

	importSite( context, next ) {
		context.primary = (
			<AsyncLoad
				require="my-sites/site-settings/section-import"
				fromSite={ get( context, 'query.from-site' ) }
				engine={ get( context, 'params.engine' ) }
			/>
		);
		next();
	},

	exportSite( context, next ) {
		context.primary = <AsyncLoad require="my-sites/site-settings/section-export" />;
		next();
	},

	guidedTransfer( context, next ) {
		context.primary = (
			<AsyncLoad require="my-sites/guided-transfer" hostSlug={ context.params.host_slug } />
		);
		next();
	},

	deleteSite( context, next ) {
		context.primary = <DeleteSite path={ context.path } />;

		next();
	},

	disconnectSite( context, next ) {
		context.store.dispatch( setSection( null, { hasSidebar: false } ) );
		context.primary = <DisconnectSite reason={ context.params.reason } />;
		next();
	},

	disconnectSiteConfirm( context, next ) {
		const { reason, text } = context.query;
		context.store.dispatch( setSection( null, { hasSidebar: false } ) );
		context.primary = <ConfirmDisconnection reason={ reason } text={ text } />;
		next();
	},

	startOver( context, next ) {
		context.primary = <StartOver path={ context.path } />;
		next();
	},

	themeSetup( context, next ) {
		const site = getSelectedSite( context.store.getState() );
		if ( site && site.jetpack ) {
			return page.redirect( '/settings/general/' + site.slug );
		}

		if ( ! config.isEnabled( 'settings/theme-setup' ) ) {
			return page.redirect( '/settings/general/' + site.slug );
		}

		context.primary = <ThemeSetup />;
		next();
	},

	manageConnection( context, next ) {
		context.primary = <ManageConnection />;
		next();
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
	},
};

export default controller;
