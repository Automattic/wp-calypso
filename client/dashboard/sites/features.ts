import config from '@automattic/calypso-config';
import { DotcomFeatures, HostingFeatures } from '../data/constants';
import { hasHostingFeature, hasPlanFeature } from '../utils/site-features';
import { isSelfHostedJetpackConnected, isP2 } from '../utils/site-types';
import type { Site, User } from '../data/types';

export function canManageSite( site: Site ) {
	if ( site.is_deleted || ! site.capabilities.manage_options ) {
		return false;
	}

	// P2 sites are not supported.
	if ( isP2( site ) ) {
		return false;
	}

	// VIP sites are not supported, yet.
	if ( site.is_vip ) {
		return false;
	}

	// Self-hosted Jetpack-connected sites are not supported, yet.
	// Only enable for the development environment, for now.
	if ( isSelfHostedJetpackConnected( site ) && config( 'env_id' ) !== 'development' ) {
		return false;
	}

	return true;
}

// Settings -> General

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

// Settings -> Actions & danger zone

export function canViewSiteActions( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canTransferSite( site: Site, user: User ) {
	const isSiteOwner = site.site_owner === user.ID;
	return ! site.is_wpcom_staging_site && isSiteOwner;
}

export function canLeaveSite( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canResetSite( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canDeleteSite( site: Site ) {
	// For staging sites, only show delete if the redesign feature flag is enabled
	if ( site.is_wpcom_staging_site ) {
		return config.isEnabled( 'hosting/staging-sites-redesign' );
	}

	return ! site.is_wpcom_staging_site;
}

export function canViewStagingSite( site: Site ) {
	return ! isSelfHostedJetpackConnected( site );
}

export function canCreateStagingSite( site: Site ) {
	return (
		hasHostingFeature( site, HostingFeatures.STAGING_SITE ) &&
		! site.is_wpcom_staging_site &&
		! site?.options?.wpcom_staging_blog_ids?.length
	);
}
