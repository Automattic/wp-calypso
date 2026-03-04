import { __ } from '@wordpress/i18n';
import { CANCEL_FLOW_TYPE, CancelFlowType } from '../../../utils/purchase';
import { CANCELLATION_OFFER_STEP } from './cancel-purchase-form/steps';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	flowType: CancelFlowType;
	purchase: Purchase;
	surveyStep?: string;
}

export default function CancelHeaderTitle( {
	flowType,
	purchase,
	surveyStep,
}: CancelHeaderTitleProps ) {
	if ( surveyStep === CANCELLATION_OFFER_STEP ) {
		return __( 'Thanks for your feedback' );
	}
	if ( flowType === CANCEL_FLOW_TYPE.REMOVE ) {
		if ( purchase.is_plan ) {
			return __( 'Remove plan' );
		}
		if ( purchase.is_domain_registration ) {
			return __( 'Remove domain' );
		}
		return __( 'Remove product' );
	}

	if ( purchase.is_plan ) {
		return __( 'Cancel plan' );
	}
	if ( purchase.is_domain_registration ) {
		return __( 'Cancel domain' );
	}
	return __( 'Cancel product' );
}
