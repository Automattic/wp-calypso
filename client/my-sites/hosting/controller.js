/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Hosting from './main';
import HostingActivate from './hosting-activate';
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';

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

export async function handleHostingPanelRedirect( context, next ) {
	const { store } = context;
	await waitForState( context );
	const state = store.getState();

	if ( canSiteViewAtomicHosting( state ) ) {
		next();
		return;
	}

	page.redirect( '/hosting-config' );
}

export function layout( context, next ) {
	context.primary = React.createElement( Hosting );
	next();
}

export function activationLayout( context, next ) {
	context.primary = React.createElement( HostingActivate );
	next();
}
