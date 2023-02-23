import { isEcommerce } from '@automattic/calypso-products/src';
import page from 'page';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { requestSite } from 'calypso/state/sites/actions';
import {
	canCurrentUserUseCustomerHome,
	getSiteOptions,
	getSiteUrl,
	getSitePlan,
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

export async function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );

	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}

	const siteId = getSelectedSiteId( state );
	const maybeStalelaunchpadScreenOption = getSiteOptions( state, siteId )?.launchpad_screen;
	const currentUrl = window.location.href;

	// We need the latest site info to determine if a user should be redirected to Launchpad.
	// As a result, we can't use locally cached data, which might think that Launchpad is
	// still enabled when, in reality, the final tasks have been completed and everything is
	// disabled. Because of this, we refetch site information and limit traffic by scoping down
	// requests to launchpad enabled sites.
	// See https://cylonp2.wordpress.com/2022/09/19/question-about-infinite-redirect/#comment-1731
	if (
		( maybeStalelaunchpadScreenOption && maybeStalelaunchpadScreenOption === 'full' ) ||
		currentUrl?.includes( 'showLaunchpad=true' )
	) {
		await context.store.dispatch( requestSite( siteId ) );
	}

	const refetchedOptions = getSiteOptions( context.store.getState(), siteId );
	const shouldRedirectToLaunchpad =
		refetchedOptions?.launchpad_screen === 'full' &&
		// Temporary hack/band-aid to resolve a stale issue with atomic that the requestSite
		// dispatch above doesnt always seem to resolve.
		! currentUrl?.includes( 'launchpadComplete=true' );

	if ( shouldRedirectToLaunchpad ) {
		// The new stepper launchpad onboarding flow isn't registered within the "page"
		// client-side router, so page.redirect won't work. We need to use the
		// traditional window.location Web API.
		const verifiedParam = new URLSearchParams( window.location.search ).has( 'verified' );
		redirectToLaunchpad( slug, refetchedOptions?.site_intent, verifiedParam );
		return;
	}

	// Ecommerce Plan's Home redirects to WooCommerce Home.
	// Temporary redirection until we create a dedicated Home for Ecommerce.
	if ( isEcommerce( getSitePlan( state, siteId ) ) ) {
		const siteUrl = getSiteUrl( state, siteId );

		if ( siteUrl !== null ) {
			// We need to make sure that sites on the eCommerce plan actually have WooCommerce installed before we redirect to the WooCommerce Home
			// So we need to trigger a fetch of site plugins
			await context.store.dispatch( fetchSitePlugins( siteId ) );
			await context.store.dispatch( fetchModuleList( siteId ) );

			const refetchedState = context.store.getState();

			const installedWooCommercePlugin = getPluginOnSite( refetchedState, siteId, 'woocommerce' );
			const isSSOEnabled = !! isJetpackModuleActive( refetchedState, siteId, 'sso' );

			if ( isSSOEnabled && installedWooCommercePlugin && installedWooCommercePlugin.active ) {
				window.location.replace( siteUrl + '/wp-admin/admin.php?page=wc-admin' );
			}
		}
	}

	next();
}
