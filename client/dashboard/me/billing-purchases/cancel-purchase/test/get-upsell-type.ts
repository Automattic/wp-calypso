import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { getUpsellType } from '../get-upsell-type';
import type { Purchase } from '@automattic/api-core';

const purchase = {
	product_slug: DotcomPlans.STUDENT,
	bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
} as Purchase;

describe( 'getUpsellType', () => {
	test( 'does not offer a monthly downgrade for Student plans', () => {
		expect(
			getUpsellType( 'tooExpensive', purchase, {
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );
	} );

	test( 'does not show an atomic upgrade upsell for Student plugin/theme reasons', () => {
		expect(
			getUpsellType( 'cannotInstallPlugins', purchase, {
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );

		expect(
			getUpsellType( 'cannotUploadThemes', purchase, {
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );
	} );
} );
