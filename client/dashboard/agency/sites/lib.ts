import type { PendingAgencySite } from '@automattic/api-core';

/**
 * A license that has been paid for (it carries a license key) but whose site
 * has not been created yet. `provisioning` does not count: creation has already
 * started, so there is nothing left to set up.
 */
export function hasWpcomLicenseWithoutSite( { features }: PendingAgencySite ): boolean {
	return features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key;
}
