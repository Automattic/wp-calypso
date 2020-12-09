/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTransactionStatus } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import getThankYouPageUrl from './get-thank-you-page-url';
import normalizeTransactionResponse from '../../lib/normalize-transaction-response';

const debug = debugFactory( 'calypso:composite-checkout:use-get-thank-you-url' );

export type GetThankYouUrl = () => string;

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
}: WithGetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( cart );
	const { transactionLastResponse } = useTransactionStatus();
	const transactionResult = normalizeTransactionResponse( transactionLastResponse );

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
	] );
	return getThankYouUrl;
}

export interface WithGetThankYouUrlProps {
	siteSlug: string | undefined;
	transactionResult: TransactionResponse | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	cart: ResponseCart;
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInEditor?: boolean;
}

export function withGetThankYouUrl< P >( Component: React.ComponentType< P > ) {
	return function CreatePaymentCompleteWrapper( props: WithGetThankYouUrlProps & P ): JSX.Element {
		const {
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
		} = props;
		const getThankYouUrl = useGetThankYouUrl( {
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
		} );
		return <Component { ...props } getThankYouUrl={ getThankYouUrl } />;
	};
}
