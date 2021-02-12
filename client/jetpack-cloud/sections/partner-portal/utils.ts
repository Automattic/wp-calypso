/**
 * Internal dependencies
 */
import { LicenseFilter, LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Get the state of a license based on its properties.
 * For example, if a license is neither attached to a site and revoked then it is both detached and revoked but
 * the dominant state would be considered to be revoked as it is of higher importance.
 *
 * @param {string | null} attachedAt Date the license was attached on, if any.
 * @param {string | null} revokedAt Date the license was revoked on, if any.
 * @returns {LicenseState} State matching one of the `LicenseState` values.
 */
export function getLicenseState(
	attachedAt: string | null,
	revokedAt: string | null
): LicenseState {
	if ( revokedAt ) {
		return LicenseState.Revoked;
	}

	if ( attachedAt ) {
		return LicenseState.Attached;
	}

	return LicenseState.Detached;
}
/**
 * Get the state of a license based on a string.
 * If the given string is not a valid LicenseState, it returns `LicenseFilter.All`
 *
 * @param {string?} value The filter string matching the `state` param in the URL
 * @returns {LicenseFilter} State matching one of LicenseFilter values.
 */
export function stringToLicenseFilter( value?: string ): LicenseFilter {
	return Object.values( LicenseFilter ).includes( value as LicenseFilter )
		? ( value as LicenseFilter )
		: LicenseFilter.All;
}
