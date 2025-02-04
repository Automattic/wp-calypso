import { LicenseSortField } from '../types';
import valueToEnum from './value-to-enum';

const internalSortFieldMap = {
	[ LicenseSortField.AttachedAt ]: 'assigned_on',
} as { [ key: string ]: string };

const publicSortFieldMap = {
	[ internalSortFieldMap[ LicenseSortField.AttachedAt ] ]: LicenseSortField.AttachedAt,
} as { [ key: string ]: LicenseSortField };

/**
 * Convert a public license sort field to its internal representation.
 * Public sort field differences are entirely cosmetic.
 * @param {string} publicSortField Public sort field value (e.g. "assigned_on").
 * @param {LicenseSortField} fallback Sort field to return if publicSortField is invalid.
 * @returns {LicenseSortField} Internal sort field.
 */
export function publicToInternalLicenseSortField(
	publicSortField: string,
	fallback: LicenseSortField
): LicenseSortField {
	return valueToEnum< LicenseSortField >(
		LicenseSortField,
		publicSortFieldMap[ publicSortField ] || publicSortField,
		fallback
	);
}

/**
 * Convert an internal license sort field to its public representation.
 * Public sort field differences are entirely cosmetic.
 * @param {LicenseSortField} internalSortField Internal sort field (e.g. LicenseSortField.AttachedAt).
 * @returns {string} Public sort field.
 */
export function internalToPublicLicenseSortField( internalSortField: LicenseSortField ): string {
	return internalSortFieldMap[ internalSortField ] || internalSortField;
}
