/**
 * Internal dependencies
 */
import { LicenseStates } from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Get the state of a license based on its properties.
 * For example, if a license is neither attached to a site and revoked then it is both detached and revoked but
 * the dominant state would be considered to be revoked as it is of higher importance.
 *
 * @param {string | null} attachedAt Date the license was attached on, if any.
 * @param {string | null} revokedAt Date the license was revoked on, if any.
 * @returns {LicenseStates} State matching one of the `LicenseStates` values.
 */
export function getLicenseState(
	attachedAt: string | null,
	revokedAt: string | null
): LicenseStates {
	if ( revokedAt ) {
		return LicenseStates.Revoked;
	}

	if ( attachedAt ) {
		return LicenseStates.Attached;
	}

	return LicenseStates.Detached;
}
