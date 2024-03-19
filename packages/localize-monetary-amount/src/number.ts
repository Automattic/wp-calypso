/**
 * Tagged type for validated integers and natural numbers.
 */
export type CheckedNumber< a > = number;

/**
 * Type tags for verified integers and natural numbers.
 *
 * NOTE: values of type CheckedNumber< Integer > or
 * CheckedNumber< NonNegativeInteger > should _only_ be created
 * by validateInteger and absoluteValue, respectively.
 */
type Integer = void;
export type NonNegativeInteger = void;

export function validateInteger( num: CheckedNumber< any > ): CheckedNumber< Integer > {
	if ( ! ( typeof num === 'number' && Number.isInteger( num ) ) ) {
		throw new Error( `Expected an integer, but got ${ num }.` );
	}
	return num;
}

export function absoluteValue(
	num: CheckedNumber< Integer >
): CheckedNumber< NonNegativeInteger > {
	return Math.abs( num );
}

export const enum Sign {
	IsPositive,
	IsZero,
	IsNegative,
}

export function signOf( num: CheckedNumber< any > ): Sign {
	if ( Math.sign( num ) < 0 ) {
		return Sign.IsNegative;
	}

	if ( Math.sign( num ) > 0 ) {
		return Sign.IsPositive;
	}

	return Sign.IsZero;
}
