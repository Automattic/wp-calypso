import { groupBy } from 'lodash';
import { isPaymentAgreement, isCreditCard } from 'calypso/lib/checkout/payment-methods';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';
import type { AppState } from 'calypso/types';

import 'calypso/state/stored-cards/init';

/**
 * Return user's stored cards from state object
 */
export const getStoredCards = ( state: AppState ): StoredCard[] =>
	( ( state.storedCards?.items ?? [] ) as StoredCard[] )
		.filter( ( method ) => isCreditCard( method ) )
		.filter( ( method ) => ! method.is_expired )
		.map( ( card ) => ( {
			...card,
			allStoredDetailsIds: [ card.stored_details_id ],
		} ) );

/**
 * Return user's stored cards including expired cards
 */
export const getAllStoredCards = ( state: AppState ): StoredCard[] =>
	( ( state.storedCards?.items ?? [] ) as StoredCard[] )
		.filter( ( method ) => isCreditCard( method ) )
		.map( ( card ) => ( {
			...card,
			allStoredDetailsIds: [ card.stored_details_id ],
		} ) );

/**
 * Return user's stored payment agreements (not cards) from state object
 *
 *
 * @param {Object} state - current state object
 * @returns {Array} Stored Payment Agreements
 */
export const getStoredPaymentAgreements = ( state: AppState ): StoredCard[] =>
	( ( state.storedCards?.items ?? [] ) as StoredCard[] )
		.filter( ( stored ) => isPaymentAgreement( stored ) )
		.map( ( method ) => ( {
			...method,
			allStoredDetailsIds: [ method.stored_details_id ],
		} ) );

/**
 * Return user's stored payment methods (not cards) from state object that share the same account
 *
 *
 * @param {Object} state - current state object
 * @returns {Array} Stored Payment Methods excluding cards
 */
export const getUniquePaymentAgreements = ( state: AppState ): StoredCard[] => {
	const paymentMethods = getStoredPaymentAgreements( state );
	const groups = groupBy( paymentMethods, 'email' );
	const paymentMethodsGroups = Object.values( groups );

	const uniquePaymentAgreements = paymentMethodsGroups.map( ( group ) => ( {
		...group[ 0 ],
		allStoredDetailsIds: group.map( ( method ) => method.stored_details_id ),
	} ) );

	return uniquePaymentAgreements;
};

/**
 * Returns a Stored Card
 */
export const getStoredCardById = (
	state: AppState,
	cardId: StoredCard[ 'stored_details_id' ]
): undefined | StoredCard =>
	getStoredCards( state )
		.filter( ( card ) => card.stored_details_id === cardId )
		.shift();

export const hasLoadedStoredCardsFromServer = ( state: AppState ) =>
	Boolean( state.storedCards?.hasLoadedFromServer );

export const isDeletingStoredCard = (
	state: AppState,
	cardId: StoredCard[ 'stored_details_id' ]
) => Boolean( state.storedCards?.isDeleting[ cardId ] );

export const isFetchingStoredCards = ( state: AppState ) =>
	Boolean( state.storedCards?.isFetching );
