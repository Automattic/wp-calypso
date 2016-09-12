/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'my-sites/controller';
import plansController from './controller';
import googleAnalyticsLandingPage from './plan-feature/google-analytics';
import currentPlanController from './current-plan/controller';

export default function() {
	if ( config.isEnabled( 'manage/plans' ) ) {
		page(
			'/plans',
			controller.navigation,
			controller.redirectToPrimary
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

		page(
			'/plans/features/google-analytics/:domain',
			controller.siteSelection,
			controller.navigation,
			googleAnalyticsLandingPage
		);

		page(
			'/plans/features/google-analytics',
			controller.sites
		);

		// This route renders the plans page for both WPcom and Jetpack sites.
		page(
			'/plans/:intervalType?/:site',
			controller.siteSelection,
			controller.navigation,
			plansController.plans
		);
	}
}
