/**
 * Internal dependencies
 */
import {
	LicenseFilter,
	LicenseSortField,
	LicenseState,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Noop which can be reused (e.g. in equality checks).
 *
 * @returns {void}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

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
 * Convert a value to a the enum member with that value or a fallback.
 * This is a hack around TypeScript's poor support of enums as types.
 *
 * @example const enumMember = valueToEnum< SomeEnumType >( SomeEnumType, 'foo', SomeEnumType.SomeMember );
 *
 * @template T
 * @param {Record< string, * >} enumType Enum type to search in.
 * @param {*} value The enum value we are looking to get the member for.
 * @param {*} fallback The fallback value in case value is not a member of enumType.
 * @returns {T} T for value or fallback
 */
export function valueToEnum< T >(
	enumType: Record< string, unknown >,
	value: unknown,
	fallback: unknown
): T {
	return Object.values( enumType ).includes( value ) ? ( value as T ) : ( fallback as T );
}

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
 *
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
 *
 * @param {LicenseFilter} internalFilter Internal filter (e.g. LicenseFilter.Attached).
 * @returns {string} Public filter.
 */
export function internalToPublicLicenseFilter( internalFilter: LicenseFilter ): string {
	return internalFilterMap[ internalFilter ] || internalFilter;
}

const internalSortFieldMap = {
	[ LicenseSortField.AttachedAt ]: 'assigned_on',
} as { [ key: string ]: string };

const publicSortFieldMap = {
	[ internalSortFieldMap[ LicenseSortField.AttachedAt ] ]: LicenseSortField.AttachedAt,
} as { [ key: string ]: LicenseSortField };

/**
 * Convert a public license sort field to its internal representation.
 * Public sort field differences are entirely cosmetic.
 *
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
 *
 * @param {LicenseSortField} internalSortField Internal sort field (e.g. LicenseSortField.AttachedAt).
 * @returns {string} Public sort field.
 */
export function internalToPublicLicenseSortField( internalSortField: LicenseSortField ): string {
	return internalSortFieldMap[ internalSortField ] || internalSortField;
}

/**
 * Check if the given URL belongs to the Partner Portal. If true, returns the URL, otherwise it returns the
 *  Partner Portal base URL: '/partner-portal'
 *
 * @param {string} returnToUrl The URL that
 * @returns {string} The right URL to return to
 */
export function ensurePartnerPortalReturnUrl( returnToUrl: string ): string {
	return returnToUrl && returnToUrl.startsWith( '/partner-portal' )
		? returnToUrl
		: '/partner-portal';
}
