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

export default function () {
	page( '/plans', siteSelection, sites, makeLayout, clientRender );
	page( '/plans/compare', siteSelection, navigation, redirectToPlans, makeLayout, clientRender );
	page(
		'/plans/compare/:domain',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page( '/plans/features', siteSelection, navigation, redirectToPlans, makeLayout, clientRender );
	page(
		'/plans/features/:domain',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender
	);
	page( '/plans/features/:feature/:domain', features, makeLayout, clientRender );
	page( '/plans/my-plan', siteSelection, sites, navigation, currentPlan, makeLayout, clientRender );
	page( '/plans/my-plan/:site', siteSelection, navigation, currentPlan, makeLayout, clientRender );
	page(
		'/plans/select/:plan/:domain',
		siteSelection,
		redirectToCheckout,
		makeLayout,
		clientRender
	);

	// This route renders the plans page for both WPcom and Jetpack sites.
	page( '/plans/:intervalType?/:site', siteSelection, navigation, plans, makeLayout, clientRender );
}
