import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../../utils/link';
import type { Agency, AgencyPendingSite } from '@automattic/api-core';

export type PressableOwnershipType = 'none' | 'regular' | 'agency';

/**
 * Where an agency's Pressable plan came from, which decides whether the menu
 * links straight into Pressable or into the A4A marketplace.
 */
export function getPressableOwnershipType(
	agency: Agency | null | undefined
): PressableOwnershipType {
	const pressable = agency?.third_party?.pressable;

	if ( ! pressable?.pressable_id ) {
		return 'none';
	}

	// A regular Pressable plan (not bought through the A4A marketplace) has a null A4A id.
	return pressable.a4a_id === null ? 'regular' : 'agency';
}

/**
 * Whether the agency has been approved. Agencies created before approval
 * existed have no status at all, and count as approved.
 */
export function isAgencyApproved( agency: Agency | null | undefined ): boolean {
	if ( ! agency ) {
		return false;
	}
	return ! agency.approval_status || agency.approval_status === 'approved';
}

/**
 * The pending sites the agency can actually set up right now. A site the
 * backend has not attached a license key to yet is not offerable.
 */
export function getAvailablePendingSites(
	pendingSites: AgencyPendingSite[] | undefined
): AgencyPendingSite[] {
	return (
		pendingSites?.filter( ( { features } ) => {
			const atomic = features?.wpcom_atomic;
			return atomic?.state === 'pending' && !! atomic?.license_key;
		} ) ?? []
	);
}

/**
 * Parses what the user typed into the connection modals, tolerating a bare
 * domain by assuming https. Returns null for anything that is not a hostname
 * with a TLD, which is what gates the modals' submit button.
 */
export function parseSiteUrl( input: string ): URL | null {
	const trimmed = input.trim();

	if ( ! trimmed ) {
		return null;
	}

	try {
		const url = new URL( /^https?:\/\//i.test( trimmed ) ? trimmed : `https://${ trimmed }` );
		return /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test( url.hostname ) ? url : null;
	} catch {
		return null;
	}
}

/** Deep link to the site's plugin installer, pre-searched for the A4A client plugin. */
export function getA4APluginInstallUrl( site: string ): string | null {
	const url = parseSiteUrl( site );

	if ( ! url ) {
		return null;
	}

	return addQueryArgs( `${ url.origin }/wp-admin/plugin-install.php`, {
		s: 'automattic-for-agencies-client',
		tab: 'search',
		type: 'term',
	} );
}

export function getJetpackConnectUrl( site: string ): string | null {
	if ( ! parseSiteUrl( site ) ) {
		return null;
	}

	// Jetpack connect takes the site as typed, not the parsed origin.
	return addQueryArgs( wpcomLink( '/jetpack/connect' ), {
		url: site.trim(),
		source: 'a8c-for-agencies',
	} );
}
