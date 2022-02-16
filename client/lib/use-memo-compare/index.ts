import { useRef } from 'react';

// See https://usehooks.com/useMemoCompare/
export function useMemoCompare< T >(
	next: T,
	compare: ( previous: T | undefined, next: T ) => boolean
): T | undefined {
	// Ref for storing previous value
	const previousRef = useRef< undefined | T >();
	const previous = previousRef.current;

	// Pass previous and next value to compare function
	// to determine whether to consider them equal.
	const isEqual = compare( previous, next );

	// If not equal update previousRef to next value.
	// We only update if not equal so that this hook continues to return
	// the same old value if compare keeps returning true.
	if ( ! isEqual ) {
		previousRef.current = next;
	}

	// Finally, return the 'previous' value which might just have been updated
	return previousRef.current;
}
