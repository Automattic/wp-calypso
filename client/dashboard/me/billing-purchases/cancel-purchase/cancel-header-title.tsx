import { __ } from '@wordpress/i18n';
import { CANCEL_FLOW_TYPE } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	flowType: string;
	purchase: Purchase;
}

export default function CancelHeaderTitle( { flowType, purchase }: CancelHeaderTitleProps ) {
	if ( flowType === CANCEL_FLOW_TYPE.REMOVE ) {
		if ( purchase.is_plan ) {
			return __( 'Remove plan' );
		}
		return __( 'Remove product' );
	}

	if ( purchase.is_plan ) {
		return __( 'Cancel plan' );
	}
	return __( 'Cancel product' );
}
