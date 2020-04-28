/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { features, plans, redirectToCheckout, redirectToPlans } from './controller';
import { currentPlan } from './current-plan/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { trackNavigationStart } from 'lib/performance-tracking';

export default function () {
	page( '/plans', trackNavigationStart( 'plans' ), siteSelection, sites, makeLayout, clientRender );
	page(
		'/plans/compare',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page(
		'/plans/compare/:domain',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page(
		'/plans/features',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page(
		'/plans/features/:domain',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page(
		'/plans/features/:feature/:domain',
		trackNavigationStart( 'plans' ),
		features,
		makeLayout,
		clientRender
	);
	page(
		'/plans/my-plan',
		trackNavigationStart( 'plans' ),
		siteSelection,
		sites,
		navigation,
		currentPlan,
		makeLayout,
		clientRender
	);
	page(
		'/plans/my-plan/:site',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		currentPlan,
		makeLayout,
		clientRender
	);
	page(
		'/plans/select/:plan/:domain',
		trackNavigationStart( 'plans' ),
		siteSelection,
		redirectToCheckout,
		makeLayout,
		clientRender
	);

	// This route renders the plans page for both WPcom and Jetpack sites.
	page(
		'/plans/:intervalType?/:site',
		trackNavigationStart( 'plans' ),
		siteSelection,
		navigation,
		plans,
		makeLayout,
		clientRender
	);
}
