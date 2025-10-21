import { useEffect, useRef } from 'react';

/**
 * Custom hook that memoizes a value based on a comparison function
 * @param value The value to memoize
 * @param compare Function to compare previous and next values
 * @returns The memoized value
 */
export function useMemoCompare< T >( value: T, compare: ( prev: T, next: T ) => boolean ): T {
	const previousRef = useRef< T >( value );
	const previous = previousRef.current;

	const isEqual = ( (): boolean => {
		// No need to run compare if the value is identical.
		if ( value === previous ) {
			return true;
		}
		return compare( previous, value );
	} )();

	useEffect( () => {
		if ( ! isEqual ) {
			previousRef.current = value;
		}
	} );

	return isEqual ? previous : value;
}
