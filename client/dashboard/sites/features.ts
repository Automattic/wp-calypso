import { DotcomFeatures } from '../data/constants';
import {
	hasPlanFeature,
	hasHostingFeatures,
	hasAdvancedHostingFeatures,
} from '../utils/site-features';
import type { Site, User } from '../data/types';

// Settings -> General

export const canViewSubscriptionGiftingSettings = ( site: Site ) =>
	hasPlanFeature( site, DotcomFeatures.SUBSCRIPTION_GIFTING );

export const canViewAgencySettings = ( site: Site ) => site.is_wpcom_atomic;

export const canViewHundredYearPlanSettings = ( site: Site ) =>
	hasPlanFeature( site, DotcomFeatures.LEGACY_CONTACT ) ||
	hasPlanFeature( site, DotcomFeatures.LOCKED_MODE );

// Settings -> Server

export const canViewWordPressSettings = ( site: Site ) => site.is_wpcom_staging_site;

export const canViewPHPSettings = hasAdvancedHostingFeatures;

export const canViewSftpSettings = hasAdvancedHostingFeatures;

export const canViewSshSettings = ( site: Site ) =>
	canViewSftpSettings( site ) && hasPlanFeature( site, DotcomFeatures.SSH );

export const canViewDatabaseSettings = hasAdvancedHostingFeatures;

export const canViewPrimaryDataCenterSettings = hasAdvancedHostingFeatures;

export const canViewStaticFile404Settings = hasAdvancedHostingFeatures;

export const canViewCachingSettings = hasHostingFeatures;

export const canViewDefensiveModeSettings = hasAdvancedHostingFeatures;

// Settings -> Actions & danger zone

export const canViewSiteActions = ( site: Site ) => ! site.is_wpcom_staging_site;

export const canRestorePlanSoftware = ( site: Site ) => site.is_wpcom_atomic;

export const canDuplicateSite = ( site: Site ) => hasPlanFeature( site, DotcomFeatures.COPY_SITE );

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
