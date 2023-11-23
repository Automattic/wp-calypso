import page from '@automattic/calypso-router';
import { useCallback, useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';

/* When adding future upsells, you can use the following approach:

export const PROFESSIONAL_EMAIL_OFFER = 'professional-email-offer';
export type SupportedUpsellType = typeof PROFESSIONAL_EMAIL_OFFER;

*/

export interface PostCheckoutUpsellRedirectorProps {
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
}: PostCheckoutUpsellRedirectorProps ): null {
	const [ isLoadingExperimentAssignment, experimentAssignment ] =
		useExperiment( upsellExperimentName );

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments = {
			siteSlug,
			receiptId: receiptId ? parseInt( receiptId, 10 ) : undefined,
			hideNudge: true,
		};

		return getThankYouPageUrl( getThankYouPageUrlArguments );
	}, [ receiptId, siteSlug ] );

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
