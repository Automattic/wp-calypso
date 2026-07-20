/**
 * @jest-environment jsdom
 */

import {
	CANCEL_FLOW_TYPE,
	getCancelIntentFromSearch,
	getDisplayVariant,
	getMutationFlowType,
	getPurchaseCancellationFlowType,
	isExpiredAndInGracePeriod,
	isExpiredOrRemoved,
	isRemoved,
	mightStillAutoRenew,
	isExpiredWithNoAutoRenewAttemptsLeft,
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

	test( 'intent=remove + auto-renew off → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { is_auto_renew_enabled: false, is_refundable: true, refund_amount: 50 } )
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
