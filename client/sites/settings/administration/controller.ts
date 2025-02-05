import page from '@automattic/calypso-router';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserStartSiteOwnerTransfer from 'calypso/state/selectors/can-current-user-start-site-owner-transfer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isSiteSettingsUntangled } from '../utils';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { AppState } from 'calypso/types';

function canDeleteSite( state: AppState, siteId: number | null ) {
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	if ( ! siteId || ! canManageOptions ) {
		// Current user doesn't have manage options to delete the site
		return false;
	}

	if ( isSiteWpcomStaging( state, siteId ) ) {
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

export function redirectIfCantDeleteSite( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	if ( ! canDeleteSite( state, getSelectedSiteId( state ) ) ) {
		return redirectToAdministration( getSelectedSiteSlug( state ) );
	}

	next();
}

export function redirectIfCantStartSiteOwnerTransfer( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	if ( ! canCurrentUserStartSiteOwnerTransfer( state, getSelectedSiteId( state ) ) ) {
		return redirectToAdministration( getSelectedSiteSlug( state ) );
	}
	next();
}

async function redirectToAdministration( siteSlug: string | null ) {
	const isUntangled = await isSiteSettingsUntangled();
	return isUntangled
		? page.redirect( '/sites/settings/site/' + siteSlug )
		: page.redirect( '/settings/general/' + siteSlug );
}
