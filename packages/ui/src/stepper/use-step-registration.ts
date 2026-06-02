import { useCallback, useState } from '@wordpress/element';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when `value` is a React element (or similar React object such
 * as a portal or lazy wrapper). React marks all such objects with `$$typeof`.
 *
 * Used in the `updateStep` bail-out so that ReactNode fields — which produce
 * a new object reference on every render — do not prevent the equality check
 * from short-circuiting.
 */
function isReactLike( value: unknown ): boolean {
	if ( value === null || typeof value !== 'object' ) {
		return false;
	}
	return '$$typeof' in ( value as Record< string, unknown > );
}

/**
 * Maintains an ordered list of registered steps for any record type that
 * includes a `value` string. Registration order is the sole source of truth
 * for index and counting.
 *
 * Used by Stepper.Root (with StepMeta) and HorizontalStepper (with
 * HorizontalStepRecord) to share the same dedup / bail-out logic.
 */
export function useStepRegistration< T extends { value: string } >() {
	const [ steps, setSteps ] = useState< T[] >( [] );

	const registerStep = useCallback( ( meta: T ) => {
		setSteps( ( prev ) => {
			// Avoid duplicate registration (e.g. from concurrent remounts or late renders)
			if ( prev.some( ( s ) => s.value === meta.value ) ) {
				return prev;
			}
			return [ ...prev, meta ];
		} );

		return () => {
			setSteps( ( prev ) => prev.filter( ( s ) => s.value !== meta.value ) );
		};
	}, [] );

	const updateStep = useCallback( ( meta: T ) => {
		setSteps( ( prev ) => {
			const idx = prev.findIndex( ( s ) => s.value === meta.value );
			if ( idx === -1 ) {
				return prev;
			}
			const existing = prev[ idx ];
			// Union keys from both objects so fields present in existing but
			// absent from meta are not silently ignored.
			const keys = [
				...new Set( [ ...Object.keys( existing ), ...Object.keys( meta ) ] ),
			] as ( keyof T )[];
			const hasChanges = keys.some( ( k ) => {
				const a = existing[ k ];
				const b = meta[ k ];
				// Skip ReactNode fields — they produce new references every render
				// but are semantically stable between renders.
				if ( isReactLike( a ) || isReactLike( b ) ) {
					return false;
				}
				return a !== b;
			} );
			if ( ! hasChanges ) {
				return prev;
			}
			return prev.map( ( s ) => ( s.value === meta.value ? meta : s ) );
		} );
	}, [] );

	return { steps, registerStep, updateStep };
}
