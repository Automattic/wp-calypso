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
	meta: LicenseMeta | null;
	referral: ReferralAPIResponse;
	meta: APILicenseMeta;
}

export interface APILicenseMeta {
	a4a_is_dev_site?: string;
	a4a_was_dev_site?: string;
	a4a_dev_site_period_end?: string;
	a4a_dev_site_period_start?: string;
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
		meta: item.meta,
		referral: item.referral,
		meta: formatLicenseMeta( item.meta ),
	} ) );
}

export function formatLicenseMeta( meta: APILicenseMeta = {} ): LicenseMeta {
	const isDevSite = meta?.a4a_is_dev_site === '1' ? true : false;
	const wasDevSite = meta?.a4a_was_dev_site === '1' ? true : false;
	const devSitePeriodEnd = meta?.a4a_dev_site_period_end;
	const devSitePeriodStart = meta?.a4a_dev_site_period_start;

	return {
		isDevSite,
		wasDevSite,
		devSitePeriodEnd, // unix timestamp
		devSitePeriodStart, // unix timestamp
	};
}
