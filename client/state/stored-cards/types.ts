import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

export interface StoredCardsState {
	items: StoredCard[];
	hasLoadedFromServer: boolean;
	isDeleting: Record< StoredCard[ 'stored_details_id' ], true | undefined >;
	isFetching: boolean;
}
