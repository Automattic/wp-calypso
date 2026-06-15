/**
 * @jest-environment jsdom
 */

import {
	CANCEL_FLOW_TYPE,
	getCancelIntentFromSearch,
	getDisplayVariant,
	getMutationFlowType,
} from '../purchase';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		is_auto_renew_enabled: true,
		is_refundable: false,
		refund_amount: 0,
		expiry_status: 'auto-renewing',
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
