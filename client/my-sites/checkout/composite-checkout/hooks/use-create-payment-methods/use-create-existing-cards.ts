import { useMemo } from 'react';
import { useMemoCompare } from 'calypso/lib/use-memo-compare';
import { createExistingCardMethod } from 'calypso/my-sites/checkout/composite-checkout/payment-methods/existing-credit-card';
import type { StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';

export default function useCreateExistingCards( {
	isStripeLoading,
	stripeLoadingError,
	storedCards,
	activePayButtonText = undefined,
	allowEditingTaxInfo,
	isTaxInfoRequired,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	storedCards: StoredPaymentMethod[];
	activePayButtonText?: string;
	allowEditingTaxInfo?: boolean;
	isTaxInfoRequired?: boolean;
} ): PaymentMethod[] {
	// The existing card payment methods do not require stripe, but the existing
	// card processor does require it (for 3DS cards), so we wait to create the
	// payment methods until stripe is loaded.
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	// Memoize the cards by comparing their stored_details_id values, in case the
	// objects themselves are recreated on each render.
	const memoizedStoredCards: StoredPaymentMethod[] = useMemoCompare(
		storedCards,
		( prev, next ) => {
			const prevIds = prev?.map( ( card ) => card.stored_details_id ) ?? [];
			const nextIds = next?.map( ( card ) => card.stored_details_id ) ?? [];
			return (
				prevIds.length === nextIds.length &&
				prevIds.every( ( id, index ) => id === nextIds[ index ] )
			);
		}
	);

	const existingCardMethods = useMemo( () => {
		return (
			memoizedStoredCards?.map( ( storedDetails ) =>
				createExistingCardMethod( {
					id: `existingCard-${ storedDetails.stored_details_id }`,
					cardholderName: storedDetails.name,
					cardExpiry: storedDetails.expiry,
					brand: storedDetails.card_type,
					last4: storedDetails.card_last_4,
					storedDetailsId: storedDetails.stored_details_id,
					paymentMethodToken: storedDetails.mp_ref,
					paymentPartnerProcessorId: storedDetails.payment_partner,
					activePayButtonText,
					allowEditingTaxInfo,
					isTaxInfoRequired,
				} )
			) ?? []
		);
	}, [ memoizedStoredCards, activePayButtonText, allowEditingTaxInfo, isTaxInfoRequired ] );

	return shouldLoad ? existingCardMethods : [];
}
