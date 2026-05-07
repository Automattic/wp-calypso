import { __ } from '@wordpress/i18n';
import { DisplayVariant } from '../../../utils/purchase';
import { CANCELLATION_OFFER_STEP } from './cancel-purchase-form/steps';
import { getCancellationHeading } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	displayVariant: DisplayVariant;
	purchase: Purchase;
	surveyStep?: string;
	surveyShown?: boolean;
}

export default function CancelHeaderTitle( {
	displayVariant,
	purchase,
	surveyStep,
	surveyShown,
}: CancelHeaderTitleProps ) {
	if ( surveyStep === CANCELLATION_OFFER_STEP ) {
		return __( 'Thanks for your feedback' );
	}
	// Once the cancel mutation has resolved and the user is on the survey,
	// the cancellation has already happened — reflect that in the title.
	if ( surveyShown && displayVariant === 'cancel' ) {
		return __( 'Cancellation confirmed' );
	}
	return getCancellationHeading( {
		purchase,
		intent: displayVariant === 'remove' ? 'remove' : 'cancel',
	} );
}
