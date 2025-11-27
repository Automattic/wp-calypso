import type { ReferralAPIResponse } from 'calypso/a8c-for-agencies/sections/referrals/types';
import type { License, LicenseMeta } from 'calypso/state/partner-portal/types';

interface APILicense {
	license_id: number;
	license_key: string;
	product_id: number;
	product: string;
	user_id: number | null;
	username: string | null;
	blog_id: number | null;
	siteurl: string | null;
	has_downloads: boolean;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
	owner_type: string | null;
	quantity: number | null;
	parent_license_id: number | null;
	meta: APILicenseMeta | null;
	referral: ReferralAPIResponse;
	subscription?: APILicenseSubscription | null;
}

export interface APILicenseMeta {
	a4a_is_dev_site?: string;
	a4a_was_dev_site?: string;
	a4a_dev_site_period_end?: string;
	a4a_dev_site_period_start?: string;
	a4a_transferred_subscription_id?: string;
	a4a_transferred_subscription_expiration?: string;
}

interface APILicenseSubscription {
	id: string;
	product_name: string;
	purchase_price: number;
	purchase_currency: string;
	billing_interval_unit: string;
	status: string;
	expiry: string | null;
	is_auto_renew_enabled: boolean;
	is_refundable: boolean;
}

export default function formatLicenses( items: APILicense[] ): License[] {
	return items.map( ( item ) => ( {
		licenseId: item.license_id,
		licenseKey: item.license_key,
		product: item.product,
		productId: item.product_id,
		userId: item.user_id,
		username: item.username,
		blogId: item.blog_id,
		siteUrl: item.siteurl,
		hasDownloads: item.has_downloads,
		issuedAt: item.issued_at,
		attachedAt: item.attached_at,
		revokedAt: item.revoked_at,
		ownerType: item.owner_type,
		quantity: item.quantity,
		parentLicenseId: item.parent_license_id,
		meta: formatLicenseMeta( item.meta ),
		referral: item.referral,
		subscription: formatLicenseSubscription( item.subscription ),
	} ) );
}

export function formatLicenseMeta( meta: APILicenseMeta | null ): LicenseMeta {
	// The API returns an empty array if no meta is present, otherwise it's an object
	if ( meta === null ) {
		return {};
	}

	const isDevSite = meta?.a4a_is_dev_site === '1';
	const wasDevSite = meta?.a4a_was_dev_site === '1';
	const devSitePeriodEnd = meta?.a4a_dev_site_period_end;
	const devSitePeriodStart = meta?.a4a_dev_site_period_start;
	const transferredSubscriptionId = meta?.a4a_transferred_subscription_id;
	const transferredSubscriptionExpiration = meta?.a4a_transferred_subscription_expiration;

	return {
		isDevSite,
		wasDevSite,
		devSitePeriodEnd, // unix timestamp
		devSitePeriodStart, // unix timestamp
		transferredSubscriptionId,
		transferredSubscriptionExpiration, // e.g.: "2025-09-15"
	};
}

function formatLicenseSubscription(
	subscription: APILicenseSubscription | null | undefined
): License[ 'subscription' ] {
	if ( ! subscription ) {
		return undefined;
	}

	return {
		id: subscription.id,
		productName: subscription.product_name,
		purchasePrice: subscription.purchase_price,
		purchaseCurrency: subscription.purchase_currency,
		billingIntervalUnit: subscription.billing_interval_unit,
		status: subscription.status,
		expiry: subscription.expiry,
		isAutoRenewEnabled: subscription.is_auto_renew_enabled,
		isRefundable: subscription.is_refundable,
	};
}
