/*
 * Marketplace Hosting route paths, shared by the router and the screens that
 * link to them so the two can't drift apart.
 */
export const MARKETPLACE_HOSTING_ROUTE = '/marketplace/hosting';
export const MARKETPLACE_PRODUCTS_ROUTE = '/marketplace/products';

// The checkout still lives in the classic dashboard; link it through `a4aLink()`.
export const CLASSIC_MARKETPLACE_CHECKOUT_PATH = '/marketplace/checkout';

export type HostingSection = 'wpcom' | 'pressable' | 'vip';

export const getMarketplaceHostingSectionRoute = ( section: HostingSection ) =>
	`${ MARKETPLACE_HOSTING_ROUTE }/${ section }`;
