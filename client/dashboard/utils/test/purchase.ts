/**
 * @jest-environment jsdom
 */

import {
	CANCEL_FLOW_TYPE,
	getCancelIntentFromSearch,
	getDisplayVariant,
	getMutationFlowType,
	getPurchaseCancellationFlowType,
	hasQueryableSite,
	isExpiredAndInGracePeriod,
	isExpiredOrRemoved,
	isRemoved,
	mightStillAutoRenew,
	isExpiredWithNoAutoRenewAttemptsLeft,
	creditCardExpiresBeforeSubscription,
	getRenewalUrlFromPurchase,
	getStudioCodeAiCreditsTitle,
	getTitleForDisplay,
	isPurchaseDowngradeEligible,
	isWithinRefundWindowDowngradeEligible,
} from '../purchase';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		is_auto_renew_enabled: true,
		is_refundable: false,
		refund_amount: 0,
		expiry_status: 'auto-renewing',
		subscription_status: 'active',
		...overrides,
	} as Purchase;
}

describe( 'getCancelIntentFromSearch', () => {
	test( 'returns "cancel" when search.intent is "cancel"', () => {
		expect( getCancelIntentFromSearch( { intent: 'cancel' } ) ).toBe( 'cancel' );
	} );

	test( 'returns "remove" when search.intent is "remove"', () => {
		expect( getCancelIntentFromSearch( { intent: 'remove' } ) ).toBe( 'remove' );
	} );

	test( 'returns null when search.intent is absent', () => {
		expect( getCancelIntentFromSearch( {} ) ).toBeNull();
	} );

	test( 'returns null for unknown strings', () => {
		expect( getCancelIntentFromSearch( { intent: 'refund' } ) ).toBeNull();
		expect( getCancelIntentFromSearch( { intent: 'delete' } ) ).toBeNull();
		expect( getCancelIntentFromSearch( { intent: '' } ) ).toBeNull();
	} );

	test( 'returns null for non-string values', () => {
		expect( getCancelIntentFromSearch( { intent: 1 } ) ).toBeNull();
		expect( getCancelIntentFromSearch( { intent: true } ) ).toBeNull();
		expect( getCancelIntentFromSearch( { intent: null } ) ).toBeNull();
		expect( getCancelIntentFromSearch( { intent: undefined } ) ).toBeNull();
	} );
} );

describe( 'getDisplayVariant', () => {
	test( 'intent=cancel → cancel', () => {
		expect( getDisplayVariant( 'cancel', CANCEL_FLOW_TYPE.REMOVE ) ).toBe( 'cancel' );
		expect( getDisplayVariant( 'cancel', CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) ).toBe( 'cancel' );
		expect( getDisplayVariant( 'cancel', CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND ) ).toBe( 'cancel' );
	} );

	test( 'intent=remove → remove', () => {
		expect( getDisplayVariant( 'remove', CANCEL_FLOW_TYPE.REMOVE ) ).toBe( 'remove' );
		expect( getDisplayVariant( 'remove', CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) ).toBe( 'remove' );
		expect( getDisplayVariant( 'remove', CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND ) ).toBe( 'remove' );
	} );

	test( 'intent absent falls back to flow-type heuristic', () => {
		expect( getDisplayVariant( null, CANCEL_FLOW_TYPE.REMOVE ) ).toBe( 'remove' );
		expect( getDisplayVariant( null, CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) ).toBe( 'cancel' );
		expect( getDisplayVariant( null, CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND ) ).toBe( 'cancel' );
	} );
} );

describe( 'getMutationFlowType', () => {
	test( 'intent=cancel + auto-renew on → CANCEL_AUTORENEW (regardless of refund state)', () => {
		expect(
			getMutationFlowType(
				'cancel',
				makePurchase( { is_auto_renew_enabled: true, is_refundable: true, refund_amount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		expect(
			getMutationFlowType(
				'cancel',
				makePurchase( { is_auto_renew_enabled: true, is_refundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
	} );

	test( 'intent=cancel + auto-renew off → falls through to flow-type heuristic', () => {
		expect(
			getMutationFlowType(
				'cancel',
				makePurchase( { is_auto_renew_enabled: false, is_refundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent=remove + auto-renew on + refund available → CANCEL_WITH_REFUND', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: true, is_refundable: true, refund_amount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'intent=remove + auto-renew off + refund available → CANCEL_WITH_REFUND', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: false, is_refundable: true, refund_amount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'intent=remove + auto-renew off + no refund → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: false, is_refundable: false, refund_amount: 0 } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent=remove + no refund → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: true, is_refundable: false, refund_amount: 0 } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent=remove + expired → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: false, expiry_status: 'expired' } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent absent → falls back to getPurchaseCancellationFlowType', () => {
		expect(
			getMutationFlowType(
				null,
				makePurchase( { is_auto_renew_enabled: true, is_refundable: true, refund_amount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
		expect(
			getMutationFlowType(
				null,
				makePurchase( { is_auto_renew_enabled: true, is_refundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		expect(
			getMutationFlowType(
				null,
				makePurchase( { is_auto_renew_enabled: false, expiry_status: 'expired' } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );
} );

describe( 'getPurchaseCancellationFlowType', () => {
	test( 'refundable → CANCEL_WITH_REFUND', () => {
		expect(
			getPurchaseCancellationFlowType( makePurchase( { is_refundable: true, refund_amount: 50 } ) )
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'refundable grace-period purchase → CANCEL_WITH_REFUND (refund wins over removal)', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_refundable: true,
					refund_amount: 50,
				} )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'non-refundable grace-period purchase → REMOVE', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_refundable: false,
					refund_amount: 0,
				} )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'non-refundable auto-renewing purchase → CANCEL_AUTORENEW', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( { is_auto_renew_enabled: true, is_refundable: false, refund_amount: 0 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
	} );
} );

describe( 'isRemoved', () => {
	test( 'is true when the subscription is no longer active', () => {
		expect( isRemoved( makePurchase( { subscription_status: 'inactive' } ) ) ).toBe( true );
	} );
	test( 'is false when the subscription is still active (including grace period)', () => {
		expect( isRemoved( makePurchase( { subscription_status: 'active' } ) ) ).toBe( false );
	} );
} );

describe( 'isExpiredAndInGracePeriod', () => {
	test( 'is true when expired but the subscription is still active', () => {
		expect(
			isExpiredAndInGracePeriod(
				makePurchase( { expiry_status: 'expired', subscription_status: 'active' } )
			)
		).toBe( true );
	} );
	test( 'is false when expired and the subscription has been removed', () => {
		expect(
			isExpiredAndInGracePeriod(
				makePurchase( { expiry_status: 'expired', subscription_status: 'inactive' } )
			)
		).toBe( false );
	} );
	test( 'is false when not expired', () => {
		expect(
			isExpiredAndInGracePeriod(
				makePurchase( { expiry_status: 'active', subscription_status: 'active' } )
			)
		).toBe( false );
	} );
} );

describe( 'isExpiredOrRemoved', () => {
	test( 'is true for a purchase in its grace period', () => {
		expect(
			isExpiredOrRemoved(
				makePurchase( { expiry_status: 'expired', subscription_status: 'active' } )
			)
		).toBe( true );
	} );
	test( 'is true for a removed purchase', () => {
		expect(
			isExpiredOrRemoved(
				makePurchase( { expiry_status: 'expired', subscription_status: 'inactive' } )
			)
		).toBe( true );
	} );
	test( 'is false for an active purchase', () => {
		expect(
			isExpiredOrRemoved(
				makePurchase( { expiry_status: 'active', subscription_status: 'active' } )
			)
		).toBe( false );
	} );
} );

describe( 'mightStillAutoRenew', () => {
	test( 'reflects the server-provided might_still_auto_renew flag', () => {
		expect( mightStillAutoRenew( makePurchase( { might_still_auto_renew: true } ) ) ).toBe( true );
		expect( mightStillAutoRenew( makePurchase( { might_still_auto_renew: false } ) ) ).toBe(
			false
		);
	} );
} );

describe( 'isExpiredWithNoAutoRenewAttemptsLeft', () => {
	test( 'is true when expired in grace period and past the last attempt date', () => {
		expect(
			isExpiredWithNoAutoRenewAttemptsLeft(
				makePurchase( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_past_last_auto_renew_attempt_date: true,
				} )
			)
		).toBe( true );
	} );
	test( 'is false when attempts may still remain', () => {
		expect(
			isExpiredWithNoAutoRenewAttemptsLeft(
				makePurchase( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_past_last_auto_renew_attempt_date: false,
				} )
			)
		).toBe( false );
	} );
	test( 'is false when the subscription has been removed', () => {
		expect(
			isExpiredWithNoAutoRenewAttemptsLeft(
				makePurchase( {
					expiry_status: 'expired',
					subscription_status: 'inactive',
					is_past_last_auto_renew_attempt_date: true,
				} )
			)
		).toBe( false );
	} );
	test( 'is false when not expired', () => {
		expect(
			isExpiredWithNoAutoRenewAttemptsLeft(
				makePurchase( {
					expiry_status: 'active',
					subscription_status: 'active',
					is_past_last_auto_renew_attempt_date: true,
				} )
			)
		).toBe( false );
	} );
} );

describe( 'hasQueryableSite', () => {
	test( 'is true for a purchase attached to a real site', () => {
		expect( hasQueryableSite( makePurchase( { blog_id: 12345 } ) ) ).toBe( true );
	} );

	test( 'is false for a holding-site purchase (siteless Akismet)', () => {
		expect(
			hasQueryableSite(
				makePurchase( {
					blog_id: 12345,
					is_attached_to_holding_site: true,
					product_type: 'akismet',
					product_slug: 'ak_personal_yearly',
				} )
			)
		).toBe( false );
	} );

	test( 'is false when there is no blog_id at all', () => {
		expect( hasQueryableSite( makePurchase( { blog_id: 0 } ) ) ).toBe( false );
	} );
} );

describe( 'creditCardExpiresBeforeSubscription', () => {
	test( 'is true when the card expires before the subscription', () => {
		expect(
			creditCardExpiresBeforeSubscription(
				makePurchase( {
					payment_type: 'credit_card',
					payment_expiry_date: '2027-01-31',
					expiry_date: '2027-06-01',
				} )
			)
		).toBe( true );
	} );

	test( 'is false when the card outlives the subscription', () => {
		expect(
			creditCardExpiresBeforeSubscription(
				makePurchase( {
					payment_type: 'credit_card',
					payment_expiry_date: '2027-06-30',
					expiry_date: '2027-01-01',
				} )
			)
		).toBe( false );
	} );

	test( 'falls back to payment_expiry when payment_expiry_date is absent', () => {
		expect(
			creditCardExpiresBeforeSubscription(
				makePurchase( {
					payment_type: 'credit_card',
					payment_expiry: '01/27',
					expiry_date: '2027-06-01',
				} )
			)
		).toBe( true );
	} );

	// The API returns no expiry date for some purchases even though the type
	// says otherwise, and parsing it as a date throws.
	test( 'is false when the purchase has no expiry date', () => {
		expect(
			creditCardExpiresBeforeSubscription(
				makePurchase( {
					payment_type: 'credit_card',
					payment_expiry_date: '2027-01-31',
					expiry_date: null as unknown as string,
				} )
			)
		).toBe( false );
	} );

	test( 'is false when the purchase has no expiry date and only payment_expiry', () => {
		expect(
			creditCardExpiresBeforeSubscription(
				makePurchase( {
					payment_type: 'credit_card',
					payment_expiry: '01/27',
					expiry_date: null as unknown as string,
				} )
			)
		).toBe( false );
	} );
} );

describe( 'getRenewalUrlFromPurchase', () => {
	test( 'omits the site slug for an A4A holding site purchase', () => {
		const url = getRenewalUrlFromPurchase(
			makePurchase( {
				ID: 28259013,
				product_slug: 'pressable_build_monthly',
				meta: 'is-a4a',
				is_attached_to_holding_site: true,
				site_slug: 'siteless.agencies.automattic.com::yETR9VrPZIMpOMIL6CICWl36',
			} )
		);

		expect( url ).toContain( '/checkout/pressable_build_monthly:is-a4a/renew/28259013/?' );
		expect( url ).not.toContain( 'siteless.agencies.automattic.com' );
	} );

	test( 'keeps the site slug for a regular site purchase', () => {
		const url = getRenewalUrlFromPurchase(
			makePurchase( {
				ID: 12345,
				product_slug: 'business-bundle',
				is_attached_to_holding_site: false,
				site_slug: 'example.wordpress.com',
			} )
		);

		expect( url ).toContain( '/checkout/business-bundle/renew/12345/example.wordpress.com?' );
	} );
} );

describe( 'isPurchaseDowngradeEligible', () => {
	// Both `plans/expired-downgrade` and `plans/delayed-downgrade` are enabled in
	// every config, so these exercise the shipping behaviour.
	test( 'is true for a downgradable plan', () => {
		expect(
			isPurchaseDowngradeEligible(
				makePurchase( { is_plan: true, is_plan_type_downgradable: true } )
			)
		).toBe( true );
	} );

	test( 'is false for a plan with nothing below it', () => {
		expect(
			isPurchaseDowngradeEligible(
				makePurchase( { is_plan: true, is_plan_type_downgradable: false } )
			)
		).toBe( false );
	} );

	test( 'is false for a non-plan product', () => {
		expect(
			isPurchaseDowngradeEligible(
				makePurchase( { is_plan: false, is_plan_type_downgradable: true } )
			)
		).toBe( false );
	} );

	test( 'is true for a downgradable plan past its expiry date', () => {
		expect(
			isPurchaseDowngradeEligible(
				makePurchase( {
					is_plan: true,
					is_plan_type_downgradable: true,
					is_past_expiry_date: true,
					expiry_status: 'expired',
					subscription_status: 'active',
				} )
			)
		).toBe( true );
	} );

	test( 'is true for a downgradable plan inside its refund window', () => {
		expect(
			isPurchaseDowngradeEligible(
				makePurchase( {
					is_plan: true,
					is_plan_type_downgradable: true,
					is_refundable: true,
				} )
			)
		).toBe( true );
	} );
} );

describe( 'isWithinRefundWindowDowngradeEligible', () => {
	const downgradablePlan = ( overrides: Partial< Purchase > = {} ) =>
		makePurchase( { is_plan: true, is_plan_type_downgradable: true, ...overrides } );

	test( 'is true for a refundable plan', () => {
		expect(
			isWithinRefundWindowDowngradeEligible( downgradablePlan( { is_refundable: true } ) )
		).toBe( true );
	} );

	test( 'is true for a refundable renewal outside the initial refund window', () => {
		expect(
			isWithinRefundWindowDowngradeEligible(
				downgradablePlan( { is_within_initial_refund_window: false, is_refundable: true } )
			)
		).toBe( true );
	} );

	test( 'is false once no receipt is refundable, even inside the initial refund window', () => {
		expect(
			isWithinRefundWindowDowngradeEligible(
				downgradablePlan( { is_within_initial_refund_window: true, is_refundable: false } )
			)
		).toBe( false );
	} );

	test( 'is false for a plan in its post-expiry grace period even when refundable', () => {
		expect(
			isWithinRefundWindowDowngradeEligible(
				downgradablePlan( {
					is_refundable: true,
					expiry_status: 'expired',
					subscription_status: 'active',
				} )
			)
		).toBe( false );
	} );

	test( 'is false for a non-plan product', () => {
		expect(
			isWithinRefundWindowDowngradeEligible(
				makePurchase( { is_plan: false, is_plan_type_downgradable: true, is_refundable: true } )
			)
		).toBe( false );
	} );
} );

describe( 'getStudioCodeAiCreditsTitle', () => {
	const STUDIO_NAME = 'Studio Code AI Credits';

	test( 'groups thousands in the credit count', () => {
		expect( getStudioCodeAiCreditsTitle( STUDIO_NAME, 1000 ) ).toBe(
			'Studio Code AI Credits (1,000 credits)'
		);
	} );

	test( 'uses the singular form for a count of one', () => {
		expect( getStudioCodeAiCreditsTitle( STUDIO_NAME, 1 ) ).toBe(
			'Studio Code AI Credits (1 credit)'
		);
	} );
} );

describe( 'getTitleForDisplay', () => {
	const priceTier = {
		minimum_units: 1,
		minimum_price: 0,
		minimum_price_display: '$0',
		maximum_price: 0,
	};

	test( 'shows the credit count for a Studio Code AI Credits purchase', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_slug: 'studio-code-ai-credits',
					product_name: 'Studio Code AI Credits',
					renewal_price_tier_usage_quantity: 500,
				} )
			)
		).toBe( 'Studio Code AI Credits (500 credits)' );
	} );

	test.each( [ null, undefined, 0 ] )(
		'shows the product name for a quantity of %p',
		( quantity ) => {
			expect(
				getTitleForDisplay(
					makePurchase( {
						product_slug: 'studio-code-ai-credits',
						product_name: 'Studio Code AI Credits',
						renewal_price_tier_usage_quantity: quantity,
					} )
				)
			).toBe( 'Studio Code AI Credits' );
		}
	);

	test( 'shows the credit count ahead of the plan title', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_slug: 'studio-code-ai-credits',
					product_name: 'Studio Code AI Credits',
					renewal_price_tier_usage_quantity: 500,
					is_plan: true,
				} )
			)
		).toBe( 'Studio Code AI Credits (500 credits)' );
	} );

	test( 'leaves Akismet Pro titles alone', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_slug: 'ak_pro5h_yearly',
					product_name: 'Akismet Pro (500 requests/month)',
					renewal_price_tier_usage_quantity: 2,
				} )
			)
		).toBe( 'Akismet Pro (1000 requests/month)' );
	} );

	test( 'leaves Jetpack AI titles alone', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_name: 'Jetpack AI Assistant',
					is_jetpack_ai_product: true,
					renewal_price_tier_usage_quantity: 1000,
					price_tier_list: [ priceTier ],
				} )
			)
		).toBe( 'Jetpack AI Assistant (1,000 requests per month)' );
	} );

	test( 'leaves Jetpack Stats titles alone', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_name: 'Jetpack Stats',
					is_jetpack_stats_product: true,
					is_free_jetpack_stats_product: false,
					renewal_price_tier_usage_quantity: 10000,
					price_tier_list: [ priceTier ],
				} )
			)
		).toBe( 'Jetpack Stats (10,000 views per month)' );
	} );

	test( 'leaves storage add-on titles alone', () => {
		expect(
			getTitleForDisplay(
				makePurchase( {
					product_slug: 'wordpress_com_1gb_space_addon_yearly',
					product_name: 'Extra Storage',
					renewal_price_tier_usage_quantity: 50,
				} )
			)
		).toBe( 'Extra Storage 50 GB' );
	} );
} );
