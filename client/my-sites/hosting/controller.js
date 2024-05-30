import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { createElement } from 'react';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import HostingActivate from './hosting-activate';
import Hosting from './main';
import StagingSiteCard from './staging-site-card';
import StagingSiteProductionCard from './staging-site-card/staging-site-production-card';

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
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isJetpackNonAtomic = ! isAtomicSite && !! site?.jetpack;

	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		if ( isJetpackNonAtomic ) {
			context.page.replace( `/overview/${ site?.slug }` );
			return;
		}
		next();
		return;
	}

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

export function renderStagingSite( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const isWpcomStagingSite = isSiteWpcomStaging( state, siteId );

	context.primary = createElement(
		! isWpcomStagingSite ? StagingSiteCard : StagingSiteProductionCard,
		{ siteId, isBorderless: true }
	);
	next();
}
