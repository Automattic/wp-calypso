import page from '@automattic/calypso-router';
import { fetchLaunchpad } from '@automattic/data-stores';
import { areLaunchpadTasksCompleted } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/task-helper';
import { isRemovedFlow } from 'calypso/landing/stepper/utils/flow-redirect-handler';
import { getQueryArgs } from 'calypso/lib/query-args';
import { bumpStat } from 'calypso/state/analytics/actions';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isSiteOnWooExpressEcommerceTrial } from 'calypso/state/sites/plans/selectors';
import { canCurrentUserUseCustomerHome, getSiteUrl } from 'calypso/state/sites/selectors';
import {
	getSelectedSiteSlug,
	getSelectedSiteId,
	getSelectedSite,
} from 'calypso/state/ui/selectors';
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

	const { verified, courseSlug, from } = getQueryArgs() || {};

	// The courseSlug is to display pages with onboarding videos for learning,
	// so we should not redirect the page to launchpad.
	if ( courseSlug ) {
		return next();
	}

	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const isSiteLaunched = site?.launch_status === 'launched' || false;
	let fetchPromise;

	if ( isSiteOnWooExpressEcommerceTrial( state, siteId ) ) {
		// Pre-fetch plugins and modules to avoid flashing content prior deciding whether to redirect.
		fetchPromise = Promise.allSettled( [
			context.store.dispatch( fetchSitePlugins( siteId ) ),
			context.store.dispatch( fetchModuleList( siteId ) ),
		] );
	}

	try {
		const {
			launchpad_screen: launchpadScreenOption,
			site_intent: siteIntentOption,
			checklist: launchpadChecklist,
		} = await fetchLaunchpad( slug );

		const shouldShowLaunchpad = ! isRemovedFlow( siteIntentOption );

		if (
			shouldShowLaunchpad &&
			launchpadScreenOption === 'full' &&
			! areLaunchpadTasksCompleted( launchpadChecklist, isSiteLaunched )
		) {
			if ( from === 'full-launchpad' ) {
				// A guard to prevent infinite loops (#98122)
				context.store.dispatch(
					bumpStat(
						'calypso_customer_home_launchpad_infinite_loop_guard',
						site?.launch_status ?? 'null'
					)
				);
			} else {
				// The new stepper launchpad onboarding flow isn't registered within the "page"
				// client-side router, so page.redirect won't work. We need to use the
				// traditional window.location Web API.
				redirectToLaunchpad( slug, siteIntentOption, verified );
				return;
			}
		}
	} catch ( error ) {}

	// Ecommerce Plan's Home redirects to WooCommerce Home.
	// Temporary redirection until we create a dedicated Home for Ecommerce.
	if ( fetchPromise?.then ) {
		// We need to make sure that sites on the eCommerce plan actually have WooCommerce installed before we redirect to the WooCommerce Home
		// So we need to trigger a fetch of site plugins
		fetchPromise.then( () => {
			const siteUrl = getSiteUrl( state, siteId );
			if ( siteUrl !== null ) {
				const refetchedState = context.store.getState();
				const installedWooCommercePlugin = getPluginOnSite( refetchedState, siteId, 'woocommerce' );
				const isSSOEnabled = !! isJetpackModuleActive( refetchedState, siteId, 'sso' );
				if ( isSSOEnabled && installedWooCommercePlugin && installedWooCommercePlugin.active ) {
					window.location.replace( siteUrl + '/wp-admin/admin.php?page=wc-admin' );
				}
			}
		} );
	}

	next();
}
