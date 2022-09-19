import page from 'page';
import { requestSite } from 'calypso/state/sites/actions';
import {
	canCurrentUserUseCustomerHome,
	isRequestingSite,
	getSiteOptions,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { redirectToLaunchpad } from 'calypso/utils';
import CustomerHome from './main';

export default async function ( context, next ) {
	const state = await context.store.getState();
	const siteId = getSelectedSiteId( state );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <CustomerHome key={ siteId } />;

	next();
}

const refetchLaunchpadScreenOption = async ( siteId, context ) => {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			if ( isRequestingSite( context.store.getState(), siteId ) ) {
				return;
			}

			unsubscribe();
			resolve();
		} );

		// Trigger a `store.subscribe()` callback
		context.store.dispatch( requestSite( siteId ) );
	} );
};

export async function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );

	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}

	const siteId = getSelectedSiteId( state );
	const maybeStalelaunchpadScreenOption = getSiteOptions( state, siteId )?.launchpad_screen;

	if ( maybeStalelaunchpadScreenOption && maybeStalelaunchpadScreenOption !== 'off' ) {
		await refetchLaunchpadScreenOption( siteId, context );
	}

	// TODO: Write explanation for refetching launchpad site options
	const refetchedOptions = getSiteOptions( context.store.getState(), siteId );
	const shouldRedirectToLaunchpad = refetchedOptions?.launchpad_screen === 'full';

	if ( shouldRedirectToLaunchpad ) {
		// The new stepper launchpad onboarding flow isn't registered within the "page"
		// client-side router, so page.redirect won't work. We need to use the
		// traditional window.location Web API.
		redirectToLaunchpad( slug, refetchedOptions?.site_intent );
		return;
	}
	next();
}
