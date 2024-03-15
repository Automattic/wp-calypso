import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type ShoppingCartItem = APIProductFamilyProduct & {
	quantity: number;
	siteUrls?: string[];
};

export interface ShoppingCartContext {
	selectedItems: ShoppingCartItem[];
	setSelectedItems: ( items: ShoppingCartItem[] ) => void;
}

export interface AssignLicenseProps {
	siteId?: string;
	suggestedProduct?: string;
	quantity?: number;
}
