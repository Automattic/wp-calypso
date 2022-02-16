import { useRef } from 'react';

// See https://usehooks.com/useMemoCompare/
export function useMemoCompare< T >( next: T, compare: ( previous: T, next: T ) => boolean ): T {
	// Ref for storing previous value
	const previousRef = useRef< undefined | T >();

	// If not equal update previousRef to next value.
	// We only update if not equal so that this hook continues to return
	// the same old value if compare keeps returning true.
	if ( previousRef.current === undefined || ! compare( previousRef.current, next ) ) {
		previousRef.current = next;
	}

	// Finally, return the 'previous' value which might just have been updated
	return previousRef.current;
}
