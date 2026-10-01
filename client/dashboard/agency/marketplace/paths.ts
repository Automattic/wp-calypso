/*
 * Marketplace Hosting route paths, shared by the router and the screens that
 * link to them so the two can't drift apart.
 */
export const MARKETPLACE_HOSTING_ROUTE = '/hosting';
export const MARKETPLACE_PRODUCTS_ROUTE = '/products';
export const MARKETPLACE_PURCHASES_ROUTE = '/purchases';
export const MARKETPLACE_REFERRAL_CHECKOUT_ROUTE = '/referral-checkout';
export const CRM_DOWNLOADS_SEGMENT = 'crm-downloads';

// The agency checkout is the WordPress.com checkout, served from the
// dashboard's own address so it runs under the agency's login.
export const AGENCY_CHECKOUT_PATH = '/checkout/agency/purchase';

export type HostingSection = 'wpcom' | 'pressable' | 'vip';

export type ReferHostingType = 'enterprise' | 'premium';

// Same paths as the classic dashboard, so links shared between the two keep working.
export const MARKETPLACE_HOSTING_REFER_SEGMENTS: Record< ReferHostingType, string > = {
	enterprise: 'refer-enterprise-hosting',
	premium: 'refer-pressable-premium-plan',
};

export const getMarketplaceReferHostingRoute = ( type: ReferHostingType ) =>
	`${ MARKETPLACE_HOSTING_ROUTE }/${ MARKETPLACE_HOSTING_REFER_SEGMENTS[ type ] }`;

export const getMarketplaceHostingSectionRoute = ( section: HostingSection ) =>
	`${ MARKETPLACE_HOSTING_ROUTE }/${ section }`;

export const getCrmDownloadsRoute = ( licenseKey: string ) =>
	`${ MARKETPLACE_PURCHASES_ROUTE }/${ CRM_DOWNLOADS_SEGMENT }/${ encodeURIComponent(
		licenseKey
	) }`;
