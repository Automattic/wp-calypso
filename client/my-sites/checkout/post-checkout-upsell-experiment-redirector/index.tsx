import page from 'page';
import { useCallback, useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';

export const PROFESSIONAL_EMAIL_UPSELL_SLUG = 'professional-email';

interface PostCheckoutUpsellExperimentRedirectorProps {
	receiptId: string | undefined;
	siteSlug: string | undefined;
	upsellExperimentAssignmentName: string;
	upsellExperimentName: string;
	upsellUrl: string;
}

export default function PostCheckoutUpsellExperimentRedirector( {
	receiptId,
	siteSlug,
	upsellExperimentAssignmentName,
	upsellExperimentName,
	upsellUrl,
}: PostCheckoutUpsellExperimentRedirectorProps ): null {
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination();

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		upsellExperimentName
	);

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments = {
			siteSlug,
			receiptId: receiptId ? parseInt( receiptId, 10 ) : undefined,
			hideNudge: true,
			isEligibleForSignupDestinationResult,
		};

		return getThankYouPageUrl( getThankYouPageUrlArguments );
	}, [ isEligibleForSignupDestinationResult, receiptId, siteSlug ] );

	useEffect( () => {
		if ( isLoadingExperimentAssignment ) {
			return;
		}

		if ( upsellExperimentAssignmentName === experimentAssignment?.variationName ) {
			page( upsellUrl );

			return;
		}

		page( getThankYouUrl() );
	} );

	return null;
}
