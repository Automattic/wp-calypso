/**
 * External dependencies
 */
import { useRef, useEffect } from 'react';

// See https://usehooks.com/useMemoCompare/
export default function useMemoCompare< A, B >(
	next: B,
	compare: ( previous: A | B | undefined, next: B ) => boolean
): A | B | undefined {
	// Ref for storing previous value
	const previousRef = useRef< undefined | A | B >();
	const previous = previousRef.current;

	// Pass previous and next value to compare function
	// to determine whether to consider them equal.
	const isEqual = compare( previous, next );

	// If not equal update previousRef to next value.
	// We only update if not equal so that this hook continues to return
	// the same old value if compare keeps returning true.
	useEffect( () => {
		if ( ! isEqual ) {
			previousRef.current = next;
		}
	} );

	// Finally, if equal then return the previous value
	return isEqual ? previous : next;
}
