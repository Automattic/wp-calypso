/**
 * Whether the licenses are assignable to WP multisite. This function uses key prefix to determine
 * if the license is compatible with multisite.
 * @param {Array<string>} licenseKeys
 * @returns {boolean} indicating if the license keys are assignable to multisite
 */
export default function areLicenseKeysAssignableToMultisite(
	licenseKeys: Array< string >
): boolean {
	// If any license keys are not Jetpack Backup or Scan, they can be assigned to multisite.
	return licenseKeys.some( ( key ) => ! /^jetpack-(backup|scan)/.test( key ) );
}
