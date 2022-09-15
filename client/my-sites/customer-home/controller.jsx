import { getQueryArg } from '@wordpress/url';
import page from 'page';
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

export function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );

	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}

	const siteId = getSelectedSiteId( state );
	const options = getSiteOptions( state, siteId );

	// Normally, checking the launchpad_screen option in redux state would be enough to decide whether
	// or not to redirect to launchpad. The option, however, is loading stale data in horizon, and presumably,
	// in production as well. The forceLoadLaunchpadData query param is a temporary patch to circumvent stale data, and
	// will avoid a redirect.
	const shouldRedirectToLaunchpad =
		options?.launchpad_screen === 'full' &&
		! getQueryArg( window.location.href, 'forceLoadLaunchpadData' );

	if ( shouldRedirectToLaunchpad ) {
		// The new stepper launchpad onboarding flow isn't registered within the "page"
		// client-side router, so page.redirect won't work. We need to use the
		// traditional window.location Web API.
		redirectToLaunchpad( slug, options?.site_intent );
		return;
	}
	next();
}
