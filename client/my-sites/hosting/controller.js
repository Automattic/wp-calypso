import page from '@automattic/calypso-router';
import { createElement } from 'react';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import HostingActivate from './hosting-activate';
import Hosting from './main';

function waitForState( context ) {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();

			const siteId = getSelectedSiteId( state );
			if ( ! siteId ) {
				return;
			}

			const currentPlan = getCurrentPlan( state, siteId );
			if ( ! currentPlan ) {
				return;
			}
			unsubscribe();
			resolve();
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch( fetchSitePlans( getSelectedSiteId( context.store.getState() ) ) );
	} );
}

export async function redirectIfInsufficientPrivileges( context, next ) {
	const { store } = context;
	await waitForState( context );
	const state = store.getState();
	const site = getSelectedSite( state );
	const canManageOptions = canCurrentUser( state, site.ID, 'manage_options' );

	// if site loaded, but user cannot manage site, redirect
	if ( site && ! canManageOptions ) {
		page.redirect( `/home/${ site.slug }` );
		return;
	}

	next();
}

export async function handleHostingPanelRedirect( context, next ) {
	const { store } = context;
	await waitForState( context );
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId ) ) {
		page.redirect( '/hosting-config' );
		return;
	}

	next();
}

export function layout( context, next ) {
	context.primary = createElement( Hosting );
	next();
}

export function activationLayout( context, next ) {
	context.primary = createElement( HostingActivate );
	next();
}
