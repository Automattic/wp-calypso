import { JetpackLicenseFilter } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import type { JetpackLicense } from '@automattic/api-core';

export type LicenseStatus = 'assigned' | 'unassigned' | 'revoked';

export function getLicenseStatus( license: JetpackLicense ): LicenseStatus {
	if ( license.revoked_at ) {
		return 'revoked';
	}
	return license.attached_at ? 'assigned' : 'unassigned';
}

export const getLicenseStatusLabels = (): Record< LicenseStatus, string > => ( {
	assigned: __( 'Assigned' ),
	unassigned: __( 'Unassigned' ),
	revoked: __( 'Revoked' ),
} );

export const LICENSE_STATUS_FILTERS: Record< LicenseStatus, JetpackLicenseFilter > = {
	assigned: JetpackLicenseFilter.Attached,
	unassigned: JetpackLicenseFilter.Detached,
	revoked: JetpackLicenseFilter.Revoked,
};

export type LicenseDisplayStatus = LicenseStatus | 'active';

// Pressable add-ons attach to the plan rather than a site, so the classic list
// never calls them unassigned. The table needs a label there, so it uses Active.
export function getLicenseDisplayStatus( license: JetpackLicense ): LicenseDisplayStatus {
	const status = getLicenseStatus( license );
	return status !== 'revoked' && isPressableAddonLicense( license ) ? 'active' : status;
}

export const getLicenseDisplayStatusLabels = (): Record< LicenseDisplayStatus, string > => ( {
	...getLicenseStatusLabels(),
	active: __( 'Active' ),
} );

// A bundle's parent license holds the quantity; its child licenses are the
// ones that get assigned to sites.
export function isBundleParent( license: JetpackLicense ): boolean {
	return ( license.quantity ?? 0 ) > 1;
}

// Standard licenses are owned by a WordPress.com user rather than the agency, so
// the agency cannot assign, download, or revoke them.
export function isPartnerLicense( license: JetpackLicense ): boolean {
	return license.owner_type !== 'user';
}

// WordPress.com hosting licenses create a new site rather than attaching to an existing one.
export function isWpcomHostingLicense( license: JetpackLicense ): boolean {
	return license.license_key.startsWith( 'wpcom-hosting' );
}

// Pressable licenses are managed in Pressable by the agency owner, not per site.
export function isPressableLicense( license: JetpackLicense ): boolean {
	return (
		license.license_key.startsWith( 'pressable-' ) ||
		license.license_key.startsWith( 'jetpack-pressable' )
	);
}

// Add-ons attach to the Pressable plan, so they are never assigned to a site.
export function isPressableAddonLicense( license: JetpackLicense ): boolean {
	return license.license_key.startsWith( 'pressable-addon' );
}

// Jetpack CRM extensions are downloaded from a dedicated page rather than the license.
export function isJetpackCrmLicense( license: JetpackLicense ): boolean {
	const key = license.license_key;
	return (
		key.startsWith( 'jetpack-complete' ) ||
		key.startsWith( 'jetpack_complete' ) ||
		key.startsWith( 'jetpack-crm' ) ||
		key.startsWith( 'jetpack_crm' )
	);
}

// An active subscription with auto-renew turned off is already winding down, so
// classic hides Upgrade and Revoke for it.
export function isAutoRenewDisabled( license: JetpackLicense ): boolean {
	const subscription = license.subscription;
	return subscription?.status === 'active' && ! subscription.is_auto_renew_enabled;
}

// Child licenses of a bundle can only be revoked individually once assigned.
export function isChildLicense( license: JetpackLicense ): boolean {
	return license.parent_license_id !== null;
}

const TRANSFERRED_BADGE_DAYS = 60;

// Extra labels the classic list shows next to the product name.
export function getLicenseTags( license: JetpackLicense ): string[] {
	const tags: string[] = [];

	if ( license.referral ) {
		tags.push( __( 'Referral' ) );
	}
	if ( license.meta?.a4a_is_dev_site === '1' ) {
		tags.push( __( 'Development' ) );
	}

	// The transferred badge only shows for a while after the old subscription ended.
	const transferredUntil = license.meta?.a4a_transferred_subscription_expiration;
	if ( transferredUntil ) {
		const hideAfter = new Date( transferredUntil );
		hideAfter.setDate( hideAfter.getDate() + TRANSFERRED_BADGE_DAYS );
		if ( new Date() < hideAfter ) {
			tags.push( __( 'Transferred' ) );
		}
	}

	return tags;
}

// Classic lists every WordPress.com hosting product under one name.
export function getLicenseProductName( license: JetpackLicense ): string {
	return license.product.startsWith( 'WordPress.com' )
		? __( 'WordPress.com Site' )
		: license.product;
}

export function getSiteHostname( siteUrl: string ): string {
	try {
		return new URL( siteUrl ).hostname;
	} catch {
		return siteUrl;
	}
}
