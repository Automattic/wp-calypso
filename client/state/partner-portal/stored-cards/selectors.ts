import 'calypso/state/partner-portal/stored-cards/init';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { AppState } from 'calypso/types';

export const getAllStoredCards = ( state: AppState ): PaymentMethod[] =>
	state?.partnerPortal?.storedCards?.items ?? [];

export const isFetchingStoredCards = ( state: AppState ) =>
	Boolean( state?.partnerPortal?.storedCards?.isFetching );

export const isDeletingStoredCard = ( state: AppState, cardId: string ) =>
	Boolean( state?.partnerPortal?.storedCards?.isDeleting[ cardId ] );

export const hasMoreStoredCards = ( state: AppState ) =>
	Boolean( state?.partnerPortal?.storedCards?.hasMoreItems );
