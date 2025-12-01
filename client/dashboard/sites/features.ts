import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { hasHostingFeature, hasPlanFeature } from '../utils/site-features';
import { isSiteMigrationInProgress } from '../utils/site-status';
import { isSelfHostedJetpackConnected, isP2 } from '../utils/site-types';
import type { Site, User } from '@automattic/api-core';

export function canManageSite( site: Site ) {
	if ( site.is_deleted || ! site.capabilities?.manage_options ) {
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

	// Self-hosted Jetpack-connected sites are not supported, yet. But disable this
	// check on the Multi-site Dashboard for development purposes, since it is not
	// yet user-facing.
	if ( isSelfHostedJetpackConnected( site ) && isDashboardBackport() ) {
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

export function canViewSiteVisibilitySettings( site: Site ) {
	// Site Visibility is a Jetpack feature; Flex sites don't have Jetpack by default.
	return ! site.is_wpcom_flex;
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
	return ! site.is_wpcom_staging_site && isSiteOwner && ! isSelfHostedJetpackConnected( site );
}

export function canLeaveSite( site: Site ) {
	return (
		! site.is_wpcom_staging_site &&
		! site.is_deleted &&
		! isP2( site ) &&
		! isSelfHostedJetpackConnected( site )
	);
}

export function canResetSite( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canRestoreSite( site: Site ) {
	return site.is_deleted && ! isP2( site ) && ! isSelfHostedJetpackConnected( site );
}

export function canSwitchEnvironment( site: Site ) {
	if ( isSiteMigrationInProgress( site ) || site.is_a4a_dev_site ) {
		return false;
	}

	return hasHostingFeature( site, HostingFeatures.STAGING_SITE );
}

export function canCreateStagingSite( site: Site ) {
	if ( isSiteMigrationInProgress( site ) || site.is_a4a_dev_site ) {
		return false;
	}

	return (
		hasHostingFeature( site, HostingFeatures.STAGING_SITE ) &&
		! site.is_wpcom_staging_site &&
		! site?.options?.wpcom_staging_blog_ids?.length
	);
}
