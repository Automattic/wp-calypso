import 'calypso/state/partner-portal/stored-cards/init';
import type { AppState } from 'calypso/types';

export const getAllStoredCards = ( state: AppState ) =>
	state?.partnerPortal?.storedCards?.items ?? [];

export const isFetchingStoredCards = ( state: AppState ) =>
	Boolean( state?.partnerPortal?.storedCards?.isFetching );
