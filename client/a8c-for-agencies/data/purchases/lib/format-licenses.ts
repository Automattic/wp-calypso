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
	meta: APILicenseMeta | []; // The API returns an empty array if no meta is present, otherwise it's an object
	referral: ReferralAPIResponse;
}

export interface APILicenseMeta {
	a4a_is_dev_site?: string;
	a4a_was_dev_site?: string;
	a4a_dev_site_period_end?: string;
	a4a_dev_site_period_start?: string;
	a4a_transferred_subscription_id?: string;
	a4a_transferred_subscription_expiration?: string;
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
	} ) );
}

export function formatLicenseMeta( meta: APILicenseMeta | [] ): LicenseMeta {
	// The API returns an empty array if no meta is present, otherwise it's an object
	if ( Array.isArray( meta ) ) {
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
