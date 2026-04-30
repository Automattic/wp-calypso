import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { isEnabled } from '@automattic/calypso-config';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { hasHostingFeature, hasPlanFeature } from '../utils/site-features';
import { isSiteMigrationInProgress } from '../utils/site-status';
import { isCommerceGarden, isSelfHostedJetpackConnected, isP2 } from '../utils/site-types';
import type { Site, User } from '@automattic/api-core';

export function canManageSite( site: Site ) {
	// Edge case: slug can be missing when the current user does not have
	// permission to manage the site.
	if ( ! site.slug ) {
		return false;
	}

	if ( site.is_deleted || ! site.capabilities?.manage_options ) {
		return false;
	}

	// Unsupported site types
	if ( isP2( site ) || site.is_vip ) {
		return false;
	}

	// Self-hosted Jetpack-connected sites are not supported in the dashboard backport.
	if ( isSelfHostedJetpackConnected( site ) ) {
		return ! isDashboardBackport();
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

export function canSwitchWordPressVersion( site: Site ) {
	if ( isEnabled( 'dashboard/wp-beta-program' ) ) {
		// Atomic-only API.
		return (
			( site.is_wpcom_atomic || site.is_wpcom_flex ) &&
			hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE )
		);
	}
	return site.is_wpcom_staging_site;
}

/**
 * Atomic/Flex site that may have been auto-enrolled in the WordPress beta
 * program despite lacking self-serve backups (and therefore the ability to
 * switch versions manually). When such a site is currently on `beta`, we
 * offer a one-way opt-out via {@link canOptOutOfWordPressBeta}.
 */
export function isWordPressBetaProgramEligible( site: Site ) {
	if ( ! isEnabled( 'dashboard/wp-beta-program' ) ) {
		return false;
	}
	if ( ! site.is_wpcom_atomic && ! site.is_wpcom_flex ) {
		return false;
	}
	return ! hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE );
}

export function canOptOutOfWordPressBeta( site: Site, versionTag: string | undefined ) {
	return isWordPressBetaProgramEligible( site ) && versionTag === 'beta';
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

export function canDisconnectSite( site: Site ) {
	return !! site.capabilities?.manage_options && isSelfHostedJetpackConnected( site );
}

export function canResetSite( site: Site ) {
	return ! isCommerceGarden( site );
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
