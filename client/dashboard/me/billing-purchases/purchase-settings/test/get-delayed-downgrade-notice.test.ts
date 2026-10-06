import { DotcomPlans } from '@automattic/api-core';
import { getDelayedDowngradeNotice } from '../get-delayed-downgrade-notice';
import type { Purchase } from '@automattic/api-core';

const RENEW_DATE = '2027-05-09T12:00:00+00:00';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		is_delayed_downgrade_pending: true,
		delayed_downgrade_to_product_slug: DotcomPlans.PERSONAL,
		renew_date: RENEW_DATE,
		is_past_first_auto_renew_attempt_date: false,
		is_past_last_auto_renew_attempt_date: false,
		...overrides,
	} as Purchase;
}

const translated = () => true;
const untranslated = () => false;

describe( 'getDelayedDowngradeNotice', () => {
	test( 'returns null when no downgrade is pending', () => {
		expect(
			getDelayedDowngradeNotice(
				makePurchase( { is_delayed_downgrade_pending: false } ),
				'en',
				translated
			)
		).toBeNull();
	} );

	test( 'names the next renewal before any renewal attempt has happened', () => {
		expect( getDelayedDowngradeNotice( makePurchase(), 'en', translated ) ).toEqual( {
			message:
				'Your plan is scheduled to downgrade to Personal at your next renewal on May 9, 2027.',
			isRetryingRenewal: false,
		} );
	} );

	test( 'explains the failed renewal once past the first attempt', () => {
		expect(
			getDelayedDowngradeNotice(
				makePurchase( { is_past_first_auto_renew_attempt_date: true } ),
				'en',
				translated
			)
		).toEqual( {
			message:
				'Your last renewal attempt didn’t go through. Your plan will change to Personal by May 9, 2027, when we next try to renew it.',
			isRetryingRenewal: true,
		} );
	} );

	test( 'explains the failed renewal without a plan name when the target is unknown', () => {
		expect(
			getDelayedDowngradeNotice(
				makePurchase( {
					is_past_first_auto_renew_attempt_date: true,
					delayed_downgrade_to_product_slug: 'unknown-product',
				} ),
				'en',
				translated
			)
		).toEqual( {
			message:
				'Your last renewal attempt didn’t go through. Your plan will be downgraded by May 9, 2027, when we next try to renew it.',
			isRetryingRenewal: true,
		} );
	} );

	test( 'falls back to the scheduled copy when the failed-renewal copy is untranslated', () => {
		expect(
			getDelayedDowngradeNotice(
				makePurchase( { is_past_first_auto_renew_attempt_date: true } ),
				'en',
				untranslated
			)
		).toEqual( {
			message:
				'Your plan is scheduled to downgrade to Personal at your next renewal on May 9, 2027.',
			isRetryingRenewal: false,
		} );
	} );

	test( 'returns null once past the last renewal attempt', () => {
		expect(
			getDelayedDowngradeNotice(
				makePurchase( {
					is_past_first_auto_renew_attempt_date: true,
					is_past_last_auto_renew_attempt_date: true,
					renew_date: undefined,
				} ),
				'en',
				translated
			)
		).toBeNull();
	} );
} );
