import {
	CANCEL_FLOW_TYPE,
	CancelFlowType,
	getDisplayVariant,
	getPurchaseCancellationFlowType,
	isAgencyPartnerType,
	isJetpackHoldingSitePurchase,
	isPartnerPurchase,
	isRemoved,
	type CancelIntent,
} from '../../../utils/purchase';
import {
	ATOMIC_REVERT_STEP,
	CANCEL_CONFIRM_STEP,
	CANCELLATION_OFFER_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from './cancel-purchase-form/steps';
import { getDowngradePlanForPurchase } from './get-downgrade-plan-for-purchase';
import { getOfferDiscountBasedOnPurchasePrice } from './get-offer-discount-based-on-purchase-price';
import type { CancelPurchaseState } from './types';
import type { CancellationOffer, PlanProduct, Purchase } from '@automattic/api-core';

function availableJetpackSurveySteps( purchase: Purchase, flowType: CancelFlowType ): string[] {
	const availableSteps = [];

	// If the subscription has already been removed or is a temporary Jetpack
	// purchase (license), we only need one "confirm" step for the survey — the
	// removal confirmation. A product that is not in use does not need to collect
	// the survey or show benefits. Note we intentionally do NOT short-circuit for
	// purchases that are merely past expiry (in the grace period): those still go
	// through the normal removal flow.
	if ( isRemoved( purchase ) || isJetpackHoldingSitePurchase( purchase ) ) {
		return [ CANCEL_CONFIRM_STEP ];
	}

	// Always include the survey step if it's a normal cancellation flow
	if (
		CANCEL_FLOW_TYPE.CANCEL_AUTORENEW === flowType ||
		CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
	) {
		availableSteps.push( FEEDBACK_STEP );
	}

	if ( CANCEL_FLOW_TYPE.REMOVE === flowType ) {
		availableSteps.push( FEEDBACK_STEP );
	}

	return availableSteps;
}

function shouldAddCancellationOfferStep(
	purchase: Purchase,
	flowType: CancelFlowType,
	cancellationOffer: CancellationOffer | undefined
): boolean {
	if ( CANCEL_FLOW_TYPE.REMOVE === flowType ) {
		const isOfferPriceSameOrLowerThanPurchasePrice = cancellationOffer
			? purchase.amount >= cancellationOffer.original_price
			: false;
		const offerDiscountBasedFromPurchasePrice = getOfferDiscountBasedOnPurchasePrice(
			purchase,
			cancellationOffer
		);

		return isOfferPriceSameOrLowerThanPurchasePrice && offerDiscountBasedFromPurchasePrice >= 10;
	}
	return false;
}

function getBasicSurveySteps( {
	purchase,
	upsell,
	hasQuestionTwo,
	plans,
}: {
	purchase: Purchase;
	upsell: CancelPurchaseState[ 'upsell' ];
	hasQuestionTwo: boolean;
	plans: PlanProduct[];
} ): string[] {
	const flowType = getPurchaseCancellationFlowType( purchase );
	const isJetpack = purchase.is_jetpack_plan_or_product;
	const downgradePlan = getDowngradePlanForPurchase( plans, purchase, upsell );
	const isDowngradePlan = [ 'downgrade-monthly', 'downgrade-personal' ].includes( upsell ?? '' );
	const hasBeenRemoved = isRemoved( purchase );

	if (
		isPartnerPurchase( purchase ) &&
		purchase.partner_type &&
		isAgencyPartnerType( purchase.partner_type )
	) {
		return [];
	}
	if ( isJetpack ) {
		return availableJetpackSurveySteps( purchase, flowType );
	}
	if ( purchase.is_domain_registration ) {
		return [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
	}
	if ( ! purchase.is_google_workspace_product && ! purchase.is_plan ) {
		return [ NEXT_ADVENTURE_STEP ];
	}
	if ( upsell && ! hasBeenRemoved && ! isDowngradePlan ) {
		return [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
	}
	// NOTE: downgradePlan only ever exists if upsell is true (see getDowngradePlanForPurchase).
	if ( upsell && ! hasBeenRemoved && downgradePlan ) {
		return [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
	}
	if ( hasQuestionTwo ) {
		return [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
	}
	return [ FEEDBACK_STEP ];
}

export function getAllSurveySteps( {
	purchase,
	intent,
	upsell,
	cancellationOffer,
	hasQuestionTwo,
	plans,
	userHasCompletedCancelSurveyForPurchase,
	isSplitCancelRemoveEnabled,
}: {
	purchase: Purchase;
	intent: CancelIntent | null;
	upsell: CancelPurchaseState[ 'upsell' ];
	cancellationOffer: CancellationOffer | undefined;
	hasQuestionTwo: boolean;
	plans: PlanProduct[];
	userHasCompletedCancelSurveyForPurchase: boolean;
	isSplitCancelRemoveEnabled: boolean;
} ): string[] {
	let steps = getBasicSurveySteps( {
		purchase,
		upsell,
		hasQuestionTwo,
		plans,
	} );
	const flowType = getPurchaseCancellationFlowType( purchase );
	const skipRemovePlanSurvey =
		getDisplayVariant( intent, flowType ) === 'remove' &&
		purchase.is_plan &&
		userHasCompletedCancelSurveyForPurchase;

	if (
		purchase.will_atomic_revert_after_removal &&
		flowType === CANCEL_FLOW_TYPE.REMOVE &&
		! isSplitCancelRemoveEnabled
	) {
		steps.push( ATOMIC_REVERT_STEP );
	}

	// Survey already done: a plan removal starts at REMOVE_PLAN_STEP. Cancel and auto-renew still show the survey.
	if ( skipRemovePlanSurvey ) {
		const stepsToRemove = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		steps = steps.filter( ( step ) => ! stepsToRemove.includes( step ) );
		steps = [ REMOVE_PLAN_STEP, ...steps ];
	}

	if ( shouldAddCancellationOfferStep( purchase, flowType, cancellationOffer ) ) {
		steps.push( CANCELLATION_OFFER_STEP );
	}

	return steps;
}
