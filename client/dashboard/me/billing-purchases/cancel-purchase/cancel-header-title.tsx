import { __ } from '@wordpress/i18n';
import { DisplayVariant } from '../../../utils/purchase';
import { CANCELLATION_OFFER_STEP } from './cancel-purchase-form/steps';
import { getCancellationHeading } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	displayVariant: DisplayVariant;
	purchase: Purchase;
	surveyStep?: string;
}

export default function CancelHeaderTitle( {
	displayVariant,
	purchase,
	surveyStep,
}: CancelHeaderTitleProps ) {
	if ( surveyStep === CANCELLATION_OFFER_STEP ) {
		return __( 'Thanks for your feedback' );
	}
	return getCancellationHeading( {
		purchase,
		intent: displayVariant === 'remove' ? 'remove' : 'cancel',
	} );
}
