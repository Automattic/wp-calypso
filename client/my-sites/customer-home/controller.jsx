import page from 'page';
import { canCurrentUserUseCustomerHome } from 'calypso/state/sites/selectors';
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

export function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );

	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}

	const launchpadEnabled = true;
	const launchpadFlow = 'newsletter';

	if ( launchpadEnabled ) {
		// The new stepper onboarding flow isn't registered within the "page" client-side
		// router, so page.redirect won't work. We need to use the traditional
		// window.location Web API.
		redirectToLaunchpad( slug, launchpadFlow );
	}
	next();
}
