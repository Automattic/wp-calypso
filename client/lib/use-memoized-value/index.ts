import { useRef } from 'react';

export type Predicate< T > = ( prev: T | undefined, next: T ) => boolean;

const defaultCompare = < T >( prev: T | undefined, next: T ): boolean => prev === next;

export function useMemoizedValue< T >(
	value: T,
	compare: Predicate< T > = defaultCompare
): T | undefined {
	const ref = useRef< T >();

	if ( ! compare( ref.current, value ) ) {
		ref.current = value;
	}

	return ref.current;
}
