import { DotcomFeatures } from '../data/constants';
import { hasAtomicFeature, hasPlanFeature } from '../utils/site-features';
import type { Site, User } from '../data/types';

export const HostingFeatures = {
	BACKUPS: DotcomFeatures.BACKUPS,
	PHP: DotcomFeatures.SFTP,
	SFTP: DotcomFeatures.SFTP,
	SSH: DotcomFeatures.SSH,
	DATABASE: DotcomFeatures.SFTP,
	PRIMARY_DATA_CENTER: DotcomFeatures.SFTP,
	STATIC_FILE_404: DotcomFeatures.SFTP,
	CACHING: DotcomFeatures.ATOMIC,
	DEFENSIVE_MODE: DotcomFeatures.SFTP,
	RESTORE_PLAN_SOFTWARE: DotcomFeatures.ATOMIC,
} as const;

export type HostingFeatures = ( typeof HostingFeatures )[ keyof typeof HostingFeatures ];

// Settings -> General

export function canViewSubscriptionGiftingSettings( site: Site ) {
	return hasPlanFeature( site, DotcomFeatures.SUBSCRIPTION_GIFTING );
}

export function canViewAgencySettings( site: Site ) {
	return site.is_wpcom_atomic;
}

export function canViewHundredYearPlanSettings( site: Site ) {
	return (
		hasPlanFeature( site, DotcomFeatures.LEGACY_CONTACT ) ||
		hasPlanFeature( site, DotcomFeatures.LOCKED_MODE )
	);
}

// Settings -> Server

export function canViewWordPressSettings( site: Site ) {
	return site.is_wpcom_staging_site;
}

export function canViewPHPSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.PHP );
}

export function canViewSftpSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.SFTP );
}

export function canViewSshSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.SSH );
}

export function canViewPrimaryDataCenterSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.PRIMARY_DATA_CENTER );
}

export function canViewStaticFile404Settings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.STATIC_FILE_404 );
}

export function canViewCachingSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.CACHING );
}

export function canViewDefensiveModeSettings( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.DEFENSIVE_MODE );
}

// Settings -> Actions & danger zone

export function canViewSiteActions( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canRestorePlanSoftware( site: Site ) {
	return hasAtomicFeature( site, HostingFeatures.RESTORE_PLAN_SOFTWARE );
}

export function canDuplicateSite( site: Site ) {
	return hasPlanFeature( site, DotcomFeatures.COPY_SITE );
}

export function canTransferSite( site: Site, user: User ) {
	const isAllowedSiteType = ! (
		( site.jetpack && ! site.is_wpcom_atomic ) ||
		site.is_wpcom_staging_site ||
		site.is_vip ||
		!! site.options?.p2_hub_blog_id ||
		site.options?.is_wpforteams_site
	);

	const isSiteOwner = site.site_owner === user.ID;
	return isAllowedSiteType && isSiteOwner;
}
