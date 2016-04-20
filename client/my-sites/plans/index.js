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
import { retarget } from 'lib/analytics/ad-tracking';
import googleAnalyticsLandingPage from './plan-feature/google-analytics';
import moreStorageLandingPage from './plan-feature/more-storage';
import customDesignLandingPage from './plan-feature/custom-design';

export default function() {
	if ( config.isEnabled( 'manage/plans' ) ) {
		page(
			'/plans',
			retarget,
			controller.siteSelection,
			controller.sites
		);

		page(
			'/plans/compare',
			retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plansCompare
		);

		page(
			'/plans/compare/:domain',
			retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plansCompare
		);

		page(
			'/plans/compare/:feature/:domain',
			retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plansCompare
		);

		page(
			'/plans/select/:plan/:domain',
			retarget,
			controller.siteSelection,
			plansController.redirectToCheckout
		);

		page(
			'/plans/features/google-analytics/:domain',
			retarget,
			controller.siteSelection,
			controller.navigation,
			googleAnalyticsLandingPage
		);

		page(
			'/plans/features/google-analytics',
			retarget,
			controller.sites
		);

		page(
			'/plans/features/custom-design/:domain',
			retarget,
			controller.siteSelection,
			controller.navigation,
			customDesignLandingPage
		);

		page(
			'/plans/features/custom-design',
			retarget,
			controller.sites
		);

		page(
			'/plans/features/more-storage/:domain',
			retarget,
			controller.siteSelection,
			controller.navigation,
			moreStorageLandingPage
		);

		page(
			'/plans/features/more-storage',
			retarget,
			controller.sites
		);

		page(
			'/plans/features/:feature/:domain',
			retarget,
			controller.siteSelection,
			plansController.features
		);

		page(
			paths.plansDestination(),
			retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plans
		);
	}
};
