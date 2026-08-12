import { __ } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import type {
	AgencyPartnerDirectoryApplication,
	AgencyPartnerDirectoryEntryStatus,
	AgencyPartnerDirectorySlug,
	AgencyProfile,
} from '@automattic/api-core';
import type { Badge } from '@automattic/ui';
import type { ComponentProps } from 'react';

export type StatusBadgeIntent = ComponentProps< typeof Badge >[ 'intent' ];

export interface DirectoryStatusBadge {
	key: 'pending' | 'approved' | 'rejected' | 'closed' | 'unknown';
	label: string;
	intent: StatusBadgeIntent;
}

export const DIRECTORY_NAMES: Record< AgencyPartnerDirectorySlug, string > = {
	wordpress: 'WordPress.com',
	woocommerce: 'WooCommerce.com',
	jetpack: 'Jetpack.com',
	pressable: 'Pressable.com',
	vip: 'WordPress VIP',
};

export function getDirectoryStatusBadge(
	status?: AgencyPartnerDirectoryEntryStatus
): DirectoryStatusBadge {
	switch ( status ) {
		case 'pending':
			return { key: 'pending', label: __( 'Pending' ), intent: 'warning' };
		case 'approved':
			return { key: 'approved', label: __( 'Approved' ), intent: 'success' };
		case 'rejected':
			return { key: 'rejected', label: __( 'Not approved' ), intent: 'error' };
		case 'closed':
			return { key: 'closed', label: __( 'Closed' ), intent: 'default' };
		default:
			return { key: 'unknown', label: '-', intent: 'default' };
	}
}

function isValidUrl( url: string ): boolean {
	return (
		url.length > 3 &&
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url )
	);
}

/**
 * Whether the agency's public profile has all the details required to be
 * listed in a partner directory. Mirrors the validation of the agency
 * details form.
 */
export function isAgencyProfileComplete( profile?: AgencyProfile | null ): boolean {
	if ( ! profile ) {
		return false;
	}

	const { company_details: company, listing_details: listing } = profile;

	return (
		company.name.length > 0 &&
		emailValidator.validate( company.email ) &&
		isValidUrl( company.website ) &&
		company.bio_description.length > 0 &&
		// The landing page URL is optional.
		( company.landing_page_url.length === 0 || isValidUrl( company.landing_page_url ) ) &&
		( company.country?.length ?? 0 ) > 0 &&
		listing.industries.length > 0 &&
		listing.services.length > 0 &&
		listing.products.length > 0 &&
		( listing.languages_spoken?.length ?? 0 ) > 0
	);
}

/**
 * Whether the application flow is fully completed: the profile is published
 * and at least one directory listing is approved and published.
 */
export function isApplicationCompleted(
	application?: AgencyPartnerDirectoryApplication | null
): boolean {
	return (
		( application?.is_published &&
			application.directories?.some(
				( directory ) => directory.status === 'approved' && directory.is_published
			) ) ??
		false
	);
}
