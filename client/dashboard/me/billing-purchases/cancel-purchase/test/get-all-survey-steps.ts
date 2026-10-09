/**
 * @jest-environment jsdom
 */

import {
	ATOMIC_REVERT_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
} from '../cancel-purchase-form/steps';
import { getAllSurveySteps } from '../get-all-survey-steps';
import type { CancelIntent } from '../../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_slug: 'business-bundle',
		is_plan: true,
		expiry_status: 'auto-renewing',
		subscription_status: 'active',
		is_auto_renew_enabled: true,
		is_refundable: false,
		refund_amount: 0,
		...overrides,
	} as Purchase;
}

const refundable: Partial< Purchase > = { is_refundable: true, refund_amount: 25 };
const autoRenewOff: Partial< Purchase > = {
	is_auto_renew_enabled: false,
	expiry_status: 'manual-renew',
};
const inGracePeriod: Partial< Purchase > = { expiry_status: 'expired' };

function getSteps( {
	purchase = makePurchase(),
	intent = null,
	userHasCompletedCancelSurveyForPurchase = true,
}: {
	purchase?: Purchase;
	intent?: CancelIntent | null;
	userHasCompletedCancelSurveyForPurchase?: boolean;
} = {} ) {
	return getAllSurveySteps( {
		purchase,
		intent,
		upsell: undefined,
		cancellationOffer: undefined,
		hasQuestionTwo: false,
		plans: [],
		userHasCompletedCancelSurveyForPurchase,
		isSplitCancelRemoveEnabled: false,
	} );
}

describe( 'getAllSurveySteps', () => {
	test.each( [
		[ 'auto-renew on', {} ],
		[ 'refundable', refundable ],
	] )( 'shows the survey with no intent on a cancel flow: %s', ( _, overrides ) => {
		expect( getSteps( { purchase: makePurchase( overrides ) } ) ).toEqual( [ FEEDBACK_STEP ] );
	} );

	test.each( [
		[ 'auto-renew off', autoRenewOff ],
		[ 'in grace period', inGracePeriod ],
	] )( 'skips the survey with no intent on a remove flow: %s', ( _, overrides ) => {
		expect( getSteps( { purchase: makePurchase( overrides ) } ) ).toEqual( [ REMOVE_PLAN_STEP ] );
	} );

	test.each( [
		[ 'refundable', refundable ],
		[ 'not refundable', {} ],
	] )( 'skips the survey on intent=remove: %s', ( _, overrides ) => {
		expect( getSteps( { purchase: makePurchase( overrides ), intent: 'remove' } ) ).toEqual( [
			REMOVE_PLAN_STEP,
		] );
	} );

	test.each( [ 'cancel', 'auto-renew' ] as const )( 'shows the survey on intent=%s', ( intent ) => {
		expect( getSteps( { purchase: makePurchase( autoRenewOff ), intent } ) ).toEqual( [
			FEEDBACK_STEP,
		] );
	} );

	test( 'shows the survey on a first-time removal', () => {
		expect(
			getSteps( { intent: 'remove', userHasCompletedCancelSurveyForPurchase: false } )
		).toEqual( [ FEEDBACK_STEP ] );
	} );

	test( 'shows the survey for products other than plans', () => {
		expect(
			getSteps( {
				purchase: makePurchase( { is_plan: false, product_slug: 'some_subscription' } ),
				intent: 'remove',
			} )
		).toEqual( [ NEXT_ADVENTURE_STEP ] );
	} );

	test( 'keeps the Atomic revert step after the remove step with split cancel/remove off', () => {
		expect(
			getSteps( {
				purchase: makePurchase( { ...autoRenewOff, will_atomic_revert_after_removal: true } ),
			} )
		).toEqual( [ REMOVE_PLAN_STEP, ATOMIC_REVERT_STEP ] );
	} );
} );
