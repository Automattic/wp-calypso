/**
 * Convert a value to a the enum member with that value or a fallback.
 * This is a hack around TypeScript's poor support of enums as types.
 * @example const enumMember = valueToEnum< SomeEnumType >( SomeEnumType, 'foo', SomeEnumType.SomeMember );
 * @template T
 * @param {Record< string, * >} enumType Enum type to search in.
 * @param {*} value The enum value we are looking to get the member for.
 * @param {*} fallback The fallback value in case value is not a member of enumType.
 * @returns {T} T for value or fallback
 */
export default function valueToEnum< T >(
	enumType: Record< string, unknown >,
	value: unknown,
	fallback: unknown
): T {
	return Object.values( enumType ).includes( value ) ? ( value as T ) : ( fallback as T );
}
