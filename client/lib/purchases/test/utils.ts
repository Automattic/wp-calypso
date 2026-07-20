import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import {
	getCancelIntentFromQuery,
	getDisplayVariant,
	getMutationFlowType,
	getPurchaseCancellationFlowType,
} from '../utils';
import type { Purchase } from '../types';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		isAutoRenewEnabled: true,
		isRefundable: false,
		refundAmount: 0,
		expiryStatus: 'autoRenewing',
		subscriptionStatus: 'active',
		...overrides,
	} as Purchase;
}

describe( 'getCancelIntentFromQuery', () => {
	test( 'returns "cancel" when query.intent is "cancel"', () => {
		expect( getCancelIntentFromQuery( { intent: 'cancel' } ) ).toBe( 'cancel' );
	} );

	test( 'returns "remove" when query.intent is "remove"', () => {
		expect( getCancelIntentFromQuery( { intent: 'remove' } ) ).toBe( 'remove' );
	} );

	test( 'returns null when query.intent is absent', () => {
		expect( getCancelIntentFromQuery( {} ) ).toBeNull();
	} );

	test( 'returns null for unknown strings', () => {
		expect( getCancelIntentFromQuery( { intent: 'refund' } ) ).toBeNull();
		expect( getCancelIntentFromQuery( { intent: '' } ) ).toBeNull();
	} );

	test( 'handles array-style duplicate params by picking the first', () => {
		expect( getCancelIntentFromQuery( { intent: [ 'remove', 'cancel' ] } ) ).toBe( 'remove' );
		expect( getCancelIntentFromQuery( { intent: [ 'cancel' ] } ) ).toBe( 'cancel' );
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
				makePurchase( { isAutoRenewEnabled: true, isRefundable: true, refundAmount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		expect(
			getMutationFlowType(
				'cancel',
				makePurchase( { isAutoRenewEnabled: true, isRefundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
	} );

	test( 'intent=cancel + auto-renew off → falls through to flow-type heuristic', () => {
		expect(
			getMutationFlowType(
				'cancel',
				makePurchase( { isAutoRenewEnabled: false, isRefundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent=remove + auto-renew on + refund available → CANCEL_WITH_REFUND', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { isAutoRenewEnabled: true, isRefundable: true, refundAmount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'intent=remove + auto-renew off → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { isAutoRenewEnabled: false, isRefundable: true, refundAmount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent=remove + no refund → REMOVE (DELETE)', () => {
		expect(
			getMutationFlowType(
				'remove',
				makePurchase( { isAutoRenewEnabled: true, isRefundable: false, refundAmount: 0 } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent absent → falls back to getPurchaseCancellationFlowType', () => {
		expect(
			getMutationFlowType(
				null,
				makePurchase( { isAutoRenewEnabled: true, isRefundable: true, refundAmount: 50 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
		expect(
			getMutationFlowType( null, makePurchase( { isAutoRenewEnabled: true, isRefundable: false } ) )
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		expect(
			getMutationFlowType(
				null,
				makePurchase( { isAutoRenewEnabled: false, isRefundable: false } )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'intent absent → expired/grace or removed purchases route to REMOVE', () => {
		// Grace period (expired but still active) with auto-renew on: routes to
		// removal rather than disabling auto-renew, matching the Dashboard.
		expect(
			getMutationFlowType(
				null,
				makePurchase( {
					expiryStatus: 'expired',
					subscriptionStatus: 'active',
					isAutoRenewEnabled: true,
				} )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );
} );

describe( 'getPurchaseCancellationFlowType', () => {
	test( 'refundable → CANCEL_WITH_REFUND', () => {
		expect(
			getPurchaseCancellationFlowType( makePurchase( { isRefundable: true, refundAmount: 50 } ) )
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'refundable grace-period purchase → CANCEL_WITH_REFUND (refund wins over removal)', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( {
					expiryStatus: 'expired',
					subscriptionStatus: 'active',
					isRefundable: true,
					refundAmount: 50,
				} )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
	} );

	test( 'non-refundable grace-period purchase → REMOVE', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( {
					expiryStatus: 'expired',
					subscriptionStatus: 'active',
					isRefundable: false,
					refundAmount: 0,
				} )
			)
		).toBe( CANCEL_FLOW_TYPE.REMOVE );
	} );

	test( 'non-refundable auto-renewing purchase → CANCEL_AUTORENEW', () => {
		expect(
			getPurchaseCancellationFlowType(
				makePurchase( { isAutoRenewEnabled: true, isRefundable: false, refundAmount: 0 } )
			)
		).toBe( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
	} );
} );
