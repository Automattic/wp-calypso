/**
 * Upper-cases the first character of a string and lower-cases the rest. Nullish
 * input becomes an empty string. Works on full Unicode code points, so a leading
 * astral character is not split.
 *
 * Intentionally typed for strings only: it does not coerce non-string values
 * (arrays, symbols, boxed primitives, `-0`), whose stringification edge cases
 * have no use here.
 * @param value The string to capitalize.
 * @returns The capitalized string.
 */
const capitalize = ( value?: string | null ): string => {
	const [ first = '', ...rest ] = ( value ?? '' ).toLowerCase();
	return first.toUpperCase() + rest.join( '' );
};

export default capitalize;
