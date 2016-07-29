/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'my-sites/controller';
import paths from './paths';
import plansController from './controller';
import googleAnalyticsLandingPage from './plan-feature/google-analytics';
import yourPlan from './current-plan/controller';

export default function() {
	if ( config.isEnabled( 'manage/plans' ) ) {
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
			'/plans/my-plan/:site',
			controller.siteSelection,
			controller.navigation,
			yourPlan
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

		page(
			paths.plansDestination(),
			controller.siteSelection,
			controller.navigation,
			plansController.plans
		);
	}
}
