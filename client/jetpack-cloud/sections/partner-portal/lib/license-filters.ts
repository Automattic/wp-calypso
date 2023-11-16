import { LicenseFilter } from '../types';
import valueToEnum from './value-to-enum';

const internalFilterMap = {
	[ LicenseFilter.NotRevoked ]: '',
	[ LicenseFilter.Attached ]: 'assigned',
	[ LicenseFilter.Detached ]: 'unassigned',
} as { [ key: string ]: string };

const publicFilterMap = {
	[ internalFilterMap[ LicenseFilter.Attached ] ]: LicenseFilter.Attached,
	[ internalFilterMap[ LicenseFilter.Detached ] ]: LicenseFilter.Detached,
} as { [ key: string ]: LicenseFilter };

/**
 * Convert a public license filter to its internal representation.
 * Public filter differences are entirely cosmetic.
 * @param {string} publicFilter Public filter value (e.g. "assigned").
 * @param {LicenseFilter} fallback Filter to return if publicFilter is invalid.
 * @returns {LicenseFilter} Internal filter.
 */
export function publicToInternalLicenseFilter(
	publicFilter: string,
	fallback: LicenseFilter
): LicenseFilter {
	return valueToEnum< LicenseFilter >(
		LicenseFilter,
		publicFilterMap[ publicFilter ] || publicFilter,
		fallback
	);
}

/**
 * Convert an internal license filter to its public representation.
 * Public filter differences are entirely cosmetic.
 * @param {LicenseFilter} internalFilter Internal filter (e.g. LicenseFilter.Attached).
 * @returns {string} Public filter.
 */
export function internalToPublicLicenseFilter( internalFilter: LicenseFilter ): string {
	return internalFilterMap[ internalFilter ] || internalFilter;
}
