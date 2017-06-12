/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import plansController from './controller';
import currentPlanController from './current-plan/controller';

export default function() {
	page(
		'/plans',
		controller.siteSelection,
		controller.sites
	);

	page(
		'/plans/compare',
		controller.siteSelection,
		controller.navigation,
		plansController.redirectToPlans
	);

	page(
		'/plans/compare/:domain',
		controller.siteSelection,
		controller.navigation,
		plansController.redirectToPlans
	);

	page(
		'/plans/features',
		controller.siteSelection,
		controller.navigation,
		plansController.redirectToPlans
	);

	page(
		'/plans/features/:domain',
		controller.siteSelection,
		controller.navigation,
		plansController.redirectToPlans
	);

	page(
		'/plans/features/:feature/:domain',
		plansController.features
	);

	page(
		'/plans/my-plan',
		controller.siteSelection,
		controller.sites,
		controller.navigation,
		currentPlanController.currentPlan
	);

	page(
		'/plans/my-plan/:site',
		controller.siteSelection,
		controller.navigation,
		currentPlanController.currentPlan
	);

	page(
		'/plans/select/:plan/:domain',
		controller.siteSelection,
		plansController.redirectToCheckout
	);

	// This route renders the plans page for both WPcom and Jetpack sites.
	page(
		'/plans/:intervalType?/:site',
		controller.siteSelection,
		controller.navigation,
		plansController.plans
	);
}
