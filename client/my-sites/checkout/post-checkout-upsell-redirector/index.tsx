import page from 'page';
import { useCallback, useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';

export const PROFESSIONAL_EMAIL_OFFER = 'professional-email-offer';
export type SupportedUpsellType = typeof PROFESSIONAL_EMAIL_OFFER;
export interface PostCheckoutUpsellRedirectorProps {
	receiptId: string | undefined;
	siteSlug: string | undefined;
	upsellMeta: string | undefined;
	upsellType: SupportedUpsellType;
}
type ExperimentAndAssignment = [ string, string ];
/**
 * Returns an array with the following three values:
 * 0: whether we are still loading the experiment,
 * 1: whether the current user is in the expected experiment,
 * 2: the actual resolved variation name.
 */
type PostCheckoutUpsellExperimentStatus = [ boolean, boolean, string | null ];

function getUpsellExperimentAndAssignment(
	upsellType: SupportedUpsellType
): ExperimentAndAssignment {
	if ( PROFESSIONAL_EMAIL_OFFER === upsellType ) {
		return [ 'promote_professional_email_post_checkout_2021_10', 'treatment' ];
	}

	// TODO: Have this be some other experiment that we can use as a fallback for useExperiment()
	return [ 'promote_professional_email_post_checkout_2021_10', '' ];
}

function usePostCheckoutUpsellExperiment(
	upsellType: SupportedUpsellType
): PostCheckoutUpsellExperimentStatus {
	const [ experimentName, requiredAssignment ] = getUpsellExperimentAndAssignment( upsellType );

	const [ isExperimentLoading, experimentAssignment ] = useExperiment( experimentName );

	if ( isExperimentLoading ) {
		return [ true, false, null ];
	}

	return [
		false,
		requiredAssignment === experimentAssignment?.variationName,
		experimentAssignment?.variationName ?? null,
	];
}

export default function PostCheckoutUpsellRedirector( {
	receiptId,
	siteSlug,
	upsellMeta,
	upsellType,
}: PostCheckoutUpsellRedirectorProps ): null {
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( {} );

	const [ isLoadingExperimentAssignment, isInExperiment ] = usePostCheckoutUpsellExperiment(
		upsellType
	);

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments = {
			siteSlug,
			receiptId,
			hideNudge: true,
			isEligibleForSignupDestinationResult,
		};

		return getThankYouPageUrl( getThankYouPageUrlArguments );
	}, [ isEligibleForSignupDestinationResult, receiptId, siteSlug ] );

	const getUpsellUrl = useCallback( () => {
		if ( PROFESSIONAL_EMAIL_OFFER === upsellType ) {
			return `/checkout/offer-professional-email/${ upsellMeta }/${ receiptId }/${ siteSlug }`;
		}

		return null;
	}, [ receiptId, siteSlug, upsellMeta, upsellType ] );

	useEffect( () => {
		if ( isLoadingExperimentAssignment ) {
			return;
		}

		if ( isInExperiment ) {
			const upsellUrl = getUpsellUrl();
			if ( null !== upsellUrl ) {
				page( upsellUrl );
				return;
			}
		}

		page( getThankYouUrl() );
	} );

	return null;
}
