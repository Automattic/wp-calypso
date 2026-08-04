import { __ } from '@wordpress/i18n';
import { CancelIntent, DisplayVariant } from '../../../utils/purchase';
import { CANCELLATION_OFFER_STEP } from './cancel-purchase-form/steps';
import { getCancellationHeading } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface CancelHeaderTitleProps {
	displayVariant: DisplayVariant;
	intent: CancelIntent | null;
	purchase: Purchase;
	surveyStep?: string;
	surveyShown?: boolean;
}

export default function CancelHeaderTitle( {
	displayVariant,
	intent,
	purchase,
	surveyStep,
	surveyShown,
}: CancelHeaderTitleProps ) {
	if ( surveyStep === CANCELLATION_OFFER_STEP ) {
		return __( 'Thanks for your feedback' );
	}
	// Only the cancel intents fire their mutation at confirm-time, so only they
	// have actually happened by the time the survey renders. Keying on `intent`
	// rather than `displayVariant` matters because displayVariant falls back to
	// 'cancel' for no-intent deep links, which still submit at survey-end.
	if ( surveyShown && intent === 'auto-renew' ) {
		return __( 'Auto-renew disabled' );
	}
	if ( surveyShown && intent === 'cancel' ) {
		return __( 'Cancellation confirmed' );
	}
	return getCancellationHeading( {
		purchase,
		intent: displayVariant,
	} );
}
