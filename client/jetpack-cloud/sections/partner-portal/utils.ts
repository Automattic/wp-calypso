/**
 * Internal dependencies
 */
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';

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
