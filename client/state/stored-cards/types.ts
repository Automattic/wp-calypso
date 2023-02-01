import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED,
} from 'calypso/state/action-types';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

export interface StoredCardsState {
	items: StoredCard[];
	hasLoadedFromServer: boolean;
	isDeleting: Record< StoredCard[ 'stored_details_id' ], true | undefined >;
	isFetching: boolean;
}

export type StoredCardsAddCompletedAction = {
	type: typeof STORED_CARDS_ADD_COMPLETED;
	item: StoredCard;
};

export type StoredCardsFetchCompletedAction = {
	type: typeof STORED_CARDS_FETCH_COMPLETED;
	list: StoredCard[];
};

export type StoredCardsDeleteCompletedAction = {
	type: typeof STORED_CARDS_DELETE_COMPLETED;
	card: {
		allStoredDetailsIds: StoredCard[ 'stored_details_id' ][];
		stored_details_id: StoredCard[ 'stored_details_id' ];
	};
};

export type StoredCardsUpdateIsBackupCompleted = {
	type: typeof STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED;
	stored_details_id: StoredCard[ 'stored_details_id' ];
	is_backup: boolean;
};

export type StoredCardsFetch = {
	type: typeof STORED_CARDS_FETCH;
};

export type StoredCardsFetchFailed = {
	type: typeof STORED_CARDS_FETCH_FAILED;
};

export type StoredCardsDelete = {
	type: typeof STORED_CARDS_DELETE;
	card: { stored_details_id: StoredCard[ 'stored_details_id' ] };
};

export type StoredCardsDeleteFailed = {
	type: typeof STORED_CARDS_DELETE_FAILED;
	card: { stored_details_id: StoredCard[ 'stored_details_id' ] };
};

export type StoredCardsActions =
	| StoredCardsAddCompletedAction
	| StoredCardsFetchCompletedAction
	| StoredCardsDeleteCompletedAction
	| StoredCardsUpdateIsBackupCompleted
	| StoredCardsFetch
	| StoredCardsFetchFailed
	| StoredCardsDelete
	| StoredCardsDeleteFailed;
