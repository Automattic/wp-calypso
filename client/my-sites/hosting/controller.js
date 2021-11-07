import page from 'page';
import { createElement } from 'react';
import canSiteViewAtomicHosting from 'calypso/state/selectors/can-site-view-atomic-hosting';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	context.primary = createElement( Hosting );
	next();
}

export function activationLayout( context, next ) {
	context.primary = createElement( HostingActivate );
	next();
}
