import { createElement } from 'react';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isJetpackNonAtomic = ! isAtomicSite && !! site?.jetpack;

	if ( isJetpackNonAtomic ) {
		context.page.replace( `/overview/${ site?.slug }` );
		return;
	}
	next();
	return;
}

export function layout( context, next ) {
	context.primary = createElement( Hosting );
	next();
}
