import { DotcomFeatures } from '../data/constants';
import {
	HostingFeaturePredicateOptions,
	hasHostingFeature,
	hasPlanFeature,
} from '../utils/site-features';
import type { Site, User } from '../data/types';

function siteHasPlanFeature( feature: DotcomFeatures ) {
	return ( site: Site ) => hasPlanFeature( site, feature );
}

function siteHasHostingFeature( feature: DotcomFeatures ) {
	return ( site: Site, opts: HostingFeaturePredicateOptions = {} ) =>
		hasHostingFeature( site, feature, opts );
}

// Settings -> General

export const canViewSubscriptionGiftingSettings = siteHasPlanFeature(
	DotcomFeatures.SUBSCRIPTION_GIFTING
);

export const canViewAgencySettings = ( site: Site ) => site.is_wpcom_atomic;

export const canViewHundredYearPlanSettings = ( site: Site ) =>
	hasPlanFeature( site, DotcomFeatures.LEGACY_CONTACT ) ||
	hasPlanFeature( site, DotcomFeatures.LOCKED_MODE );

// Settings -> Server

export const canViewWordPressSettings = ( site: Site ) => site.is_wpcom_staging_site;
export const canViewCachingSettings = siteHasHostingFeature( DotcomFeatures.ATOMIC );
export const canViewPHPSettings = siteHasHostingFeature( DotcomFeatures.SFTP );
export const canViewSftpSettings = siteHasHostingFeature( DotcomFeatures.SFTP );
export const canViewSshSettings = siteHasHostingFeature( DotcomFeatures.SSH );
export const canViewDatabaseSettings = siteHasHostingFeature( DotcomFeatures.SFTP );
export const canViewPrimaryDataCenterSettings = siteHasHostingFeature( DotcomFeatures.SFTP );
export const canViewStaticFile404Settings = siteHasHostingFeature( DotcomFeatures.SFTP );
export const canViewDefensiveModeSettings = siteHasHostingFeature( DotcomFeatures.SFTP );

// Settings -> Actions & danger zone

export const canViewSiteActions = ( site: Site ) => ! site.is_wpcom_staging_site;
export const canRestorePlanSoftware = siteHasHostingFeature( DotcomFeatures.ATOMIC );
export const canDuplicateSite = siteHasPlanFeature( DotcomFeatures.COPY_SITE );
export const canTransferSite = ( site: Site, user: User ) => {
	const isAllowedSiteType = ! (
		( site.jetpack && ! site.is_wpcom_atomic ) ||
		site.is_wpcom_staging_site ||
		site.is_vip ||
		!! site.options?.p2_hub_blog_id ||
		site.options?.is_wpforteams_site
	);

	const isSiteOwner = site.site_owner === user.ID;
	return isAllowedSiteType && isSiteOwner;
};
