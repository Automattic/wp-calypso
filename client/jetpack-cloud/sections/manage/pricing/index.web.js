import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import * as controller from './controller';

export default function () {
	const lang = getLanguageRouteParam();

	page(
		`/${ lang }/manage/pricing`,
		setLocaleMiddleware(),
		/**
		 * For now we are disabling the Jetpack Manage pricing page (i.e.- commenting out
		 * `controller.jetpackManagePricingContext`) and instead redirecting to the
		 * Jetpack.com For Agencies landing page (https://jetpack.com/for-agencies/).
		 *
		 * See also: https://wp.me/pbNhbs-axp-p2
		 */
		// controller.jetpackManagePricingContext,
		controller.redirectToJetpackComA4aLanding,
		makeLayout,
		clientRender
	);
}
