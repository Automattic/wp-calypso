import { isEcommerce } from '@automattic/calypso-products/src';
import page from 'page';
import { fetchLaunchpadChecklist } from 'calypso/../packages/help-center/src/hooks/use-launchpad';
import { fetchLaunchpad } from 'calypso/data/sites/use-launchpad';
import { areLaunchpadTasksCompleted } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/task-helper';
import { getQueryArgs } from 'calypso/lib/query-args';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import {
	canCurrentUserUseCustomerHome,
	getSiteUrl,
	getSitePlan,
} from 'calypso/state/sites/selectors';
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

	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const isSiteLaunched = site?.launch_status === 'launched' || false;

	try {
		const { launchpad_screen: launchpadScreenOption, site_intent: siteIntentOption } =
			await fetchLaunchpad( slug );
		const { checklist: launchpadChecklist } = await fetchLaunchpadChecklist(
			slug,
			siteIntentOption
		);

		if (
			launchpadScreenOption === 'full' &&
			! areLaunchpadTasksCompleted( launchpadChecklist, isSiteLaunched )
		) {
			// The new stepper launchpad onboarding flow isn't registered within the "page"
			// client-side router, so page.redirect won't work. We need to use the
			// traditional window.location Web API.
			const verifiedParam = getQueryArgs()?.verified;
			redirectToLaunchpad( slug, siteIntentOption, verifiedParam );
			return;
		}
	} catch ( error ) {}

	// Ecommerce Plan's Home redirects to WooCommerce Home.
	// Temporary redirection until we create a dedicated Home for Ecommerce.
	if ( isEcommerce( getSitePlan( state, siteId ) ) ) {
		const siteUrl = getSiteUrl( state, siteId );

		if ( siteUrl !== null ) {
			// We need to make sure that sites on the eCommerce plan actually have WooCommerce installed before we redirect to the WooCommerce Home
			// So we need to trigger a fetch of site plugins
			await context.store.dispatch( fetchSitePlugins( siteId ) );

			const refetchedState = context.store.getState();
			const installedWooCommercePlugin = getPluginOnSite( refetchedState, siteId, 'woocommerce' );
			if ( installedWooCommercePlugin && installedWooCommercePlugin.active ) {
				window.location.replace( siteUrl + '/wp-admin/admin.php?page=wc-admin' );
			}
		}
	}

	next();
}
