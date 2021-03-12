/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import getThankYouPageUrl from './get-thank-you-page-url';
import type { TransactionResponse } from '../../types/wpcom-store-state';
import {
	isTreatmentOneClickTest,
	isTreatmentDifmUpsellTest,
} from 'calypso/state/marketing/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

const debug = debugFactory( 'calypso:composite-checkout:use-get-thank-you-url' );

export type GetThankYouUrl = () => string;

export default function useGetThankYouUrl( {
	siteSlug,
	transactionResult,
	redirectTo,
	purchaseId,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	hideNudge,
	isInEditor,
}: GetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );
	const shouldShowOneClickTreatment = useSelector( ( state ) => isTreatmentOneClickTest( state ) );
	const shouldShowDifmUpsell = useSelector( ( state ) => isTreatmentDifmUpsellTest( state ) );
	const previousRoute = useSelector( ( state ) => getPreviousRoute( state ) );

	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( cart );

	const getThankYouUrl = useCallback( () => {
		debug( 'for getThankYouUrl, transactionResult is', transactionResult );
		const receiptId = transactionResult?.receipt_id;
		const orderId = transactionResult?.order_id;

		const getThankYouPageUrlArguments = {
			siteSlug,
			adminUrl,
			receiptId,
			orderId,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			productAliasFromUrl,
			isEligibleForSignupDestinationResult,
			shouldShowOneClickTreatment,
			shouldShowDifmUpsell,
			hideNudge,
			isInEditor,
			previousRoute,
		};
		debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		debug( 'getThankYouUrl returned', url );
		return url;
	}, [
		isInEditor,
		transactionResult,
		isEligibleForSignupDestinationResult,
		shouldShowOneClickTreatment,
		shouldShowDifmUpsell,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		productAliasFromUrl,
		redirectTo,
		feature,
		purchaseId,
		cart,
		hideNudge,
	] );
	return getThankYouUrl;
}

export interface GetThankYouUrlProps {
	siteSlug: string | undefined;
	transactionResult?: TransactionResponse | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	cart: ResponseCart;
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInEditor?: boolean;
}
