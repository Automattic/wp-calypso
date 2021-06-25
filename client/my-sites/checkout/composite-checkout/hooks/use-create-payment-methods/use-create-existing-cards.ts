/**
 * External dependencies
 */
import { useMemo } from 'react';
import { createExistingCardMethod } from '@automattic/composite-checkout';
import type { PaymentMethod } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useMemoCompare from '../use-memo-compare';
import type { StoredCard } from '../../types/stored-cards';

export default function useCreateExistingCards( {
	storedCards,
	activePayButtonText = undefined,
}: {
	storedCards: StoredCard[];
	activePayButtonText?: string;
} ): PaymentMethod[] {
	// Memoize the cards by comparing their stored_details_id values, in case the
	// objects themselves are recreated on each render.
	const memoizedStoredCards: StoredCard[] | undefined = useMemoCompare(
		storedCards,
		( prev: undefined | StoredCard[], next: undefined | StoredCard[] ) => {
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
					last4: storedDetails.card,
					storedDetailsId: storedDetails.stored_details_id,
					paymentMethodToken: storedDetails.mp_ref,
					paymentPartnerProcessorId: storedDetails.payment_partner,
					activePayButtonText,
				} )
			) ?? []
		);
	}, [ memoizedStoredCards, activePayButtonText ] );
	return existingCardMethods;
}
