/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import plansController from './controller';
import currentPlanController from './current-plan/controller';

export default function() {
	page( '/plans', siteSelection, sites );
	page( '/plans/compare', siteSelection, navigation, plansController.redirectToPlans );
	page( '/plans/compare/:domain', siteSelection, navigation, plansController.redirectToPlans );
	page( '/plans/features', siteSelection, navigation, plansController.redirectToPlans );
	page( '/plans/features/:domain', siteSelection, navigation, plansController.redirectToPlans );
	page( '/plans/features/:feature/:domain', plansController.features );
	page( '/plans/my-plan', siteSelection, sites, navigation, currentPlanController.currentPlan );
	page( '/plans/my-plan/:site', siteSelection, navigation, currentPlanController.currentPlan );
	page( '/plans/select/:plan/:domain', siteSelection, plansController.redirectToCheckout );

	// This route renders the plans page for both WPcom and Jetpack sites.
	page( '/plans/:intervalType?/:site', siteSelection, navigation, plansController.plans );
}
