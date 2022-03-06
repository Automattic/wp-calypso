import 'calypso/state/partner-portal/stored-cards/init';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { AppState } from 'calypso/types';

export const getAllStoredCards = ( state: AppState ): PaymentMethod[] =>
	state?.partnerPortal?.storedCards?.items ?? [];

export const isFetchingStoredCards = ( state: AppState ) =>
	Boolean( state?.partnerPortal?.storedCards?.isFetching );
