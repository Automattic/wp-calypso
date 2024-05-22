import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type ShoppingCartItem = APIProductFamilyProduct & {
	quantity: number;
	siteUrls?: string[];
};

export type MarketplaceType = 'referral' | 'regular';

export interface ShoppingCartContext {
	selectedCartItems: ShoppingCartItem[];
	setSelectedCartItems: ( items: ShoppingCartItem[] ) => void;
}

export interface MarketplaceTypeContext {
	marketplaceType: MarketplaceType;
}

export interface AssignLicenseProps {
	siteId?: string;
	suggestedProduct?: string;
	quantity?: number;
	purchaseType?: MarketplaceType;
}

export type HostingType = 'pressable-hosting' | 'wpcom-hosting';
