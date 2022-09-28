import page from 'page';
import { requestSite } from 'calypso/state/sites/actions';
import { canCurrentUserUseCustomerHome, getSiteOptions } from 'calypso/state/sites/selectors';
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

export async function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );

	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}

	const siteId = getSelectedSiteId( state );
	const maybeStalelaunchpadScreenOption = getSiteOptions( state, siteId )?.launchpad_screen;

	// We need the latest site info to determine if a user should be redirected to Launchpad.
	// As a result, we can't use locally cached data, which might think that Launchpad is
	// still enabled when, in reality, the final tasks have been completed and everything is
	// disabled. Because of this, we refetch site information and limit traffic by scoping down
	// requests to launchpad enabled sites.
	// See https://cylonp2.wordpress.com/2022/09/19/question-about-infinite-redirect/#comment-1731
	if ( maybeStalelaunchpadScreenOption && maybeStalelaunchpadScreenOption === 'full' ) {
		await context.store.dispatch( requestSite( siteId ) );
	}

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
