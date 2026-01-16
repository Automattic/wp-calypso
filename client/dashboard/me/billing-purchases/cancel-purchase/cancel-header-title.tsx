import { __ } from '@wordpress/i18n';
import { CANCEL_FLOW_TYPE, CancelFlowType } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	flowType: CancelFlowType;
	purchase: Purchase;
}

export default function CancelHeaderTitle( { flowType, purchase }: CancelHeaderTitleProps ) {
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
