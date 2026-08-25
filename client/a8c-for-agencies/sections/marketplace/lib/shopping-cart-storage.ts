import type { MarketplaceType } from '../types';

export const SELECTED_ITEMS_SESSION_STORAGE_KEY = 'shopping-card-selected-items';
export const SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL = 'referrals-shopping-card-selected-items';

export function getSelectedItemsStorageKey( marketplaceType: MarketplaceType ): string {
	return marketplaceType === 'regular'
		? SELECTED_ITEMS_SESSION_STORAGE_KEY
		: SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL;
}

export function clearPersistedSelectedItems( marketplaceType: MarketplaceType = 'regular' ): void {
	sessionStorage.removeItem( getSelectedItemsStorageKey( marketplaceType ) );
}
