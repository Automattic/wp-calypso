/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { defaultRegistry, useTransactionStatus } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import getThankYouPageUrl from './get-thank-you-page-url';
import normalizeTransactionResponse from '../../lib/normalize-transaction-response';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:use-get-thank-you-url' );

type GetThankYouUrl = () => string;

export default function useGetThankYouUrl( {
	siteSlug,
	redirectTo,
	purchaseId,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	hideNudge,
	isInEditor,
}: {
	siteSlug: string | undefined;
	redirectTo: string | undefined;
	purchaseId?: number | undefined;
	feature: string | undefined;
	cart: ResponseCart;
	isJetpackNotAtomic: boolean;
	productAliasFromUrl: string | undefined;
	hideNudge: boolean;
	isInEditor?: boolean;
} ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( cart );
	const { transactionLastResponse } = useTransactionStatus();
	const transactionResult = normalizeTransactionResponse( transactionLastResponse );

	const getThankYouUrl = useCallback( () => {
		debug( 'for getThankYouUrl, transactionResult is', transactionResult );
		const receiptId = transactionResult.receipt_id;
		const orderId = transactionResult.order_id;

		if ( siteSlug === 'no-user' || ! siteSlug ) {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			siteSlug = select( 'wpcom' ).getSiteSlug();
		}

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
		};
		debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		debug( 'getThankYouUrl returned', url );
		return url;
	}, [
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
	] );
	return getThankYouUrl;
}
