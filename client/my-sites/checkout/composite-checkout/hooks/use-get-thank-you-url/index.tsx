/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { WPCOMTransactionEndpointResponse } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import getThankYouPageUrl from './get-thank-you-page-url';

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
	isJetpackCheckout = false,
}: GetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );

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
			hideNudge,
			isInEditor,
			isJetpackCheckout,
		};
		debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		debug( 'getThankYouUrl returned', url );
		return url;
	}, [
		isInEditor,
		transactionResult,
		isEligibleForSignupDestinationResult,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		productAliasFromUrl,
		redirectTo,
		feature,
		purchaseId,
		cart,
		hideNudge,
		isJetpackCheckout,
	] );
	return getThankYouUrl;
}

export interface GetThankYouUrlProps {
	siteSlug: string | undefined;
	transactionResult?: WPCOMTransactionEndpointResponse | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	cart: ResponseCart;
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInEditor?: boolean;
	isJetpackCheckout?: boolean;
}
