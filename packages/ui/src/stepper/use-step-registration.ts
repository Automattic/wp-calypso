import { useCallback, useState } from '@wordpress/element';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maintains an ordered list of registered steps for any record type that
 * includes a `value` string. Registration order is the sole source of truth
 * for index and counting.
 *
 * Used by Stepper.Root (with StepMeta) to maintain step order and metadata.
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
			if ( keys.every( ( k ) => existing[ k ] === meta[ k ] ) ) {
				return prev;
			}
			return prev.map( ( s ) => ( s.value === meta.value ? meta : s ) );
		} );
	}, [] );

	return { steps, registerStep, updateStep };
}
