import { useCallback, useRef, useState } from '@wordpress/element';
import { warning } from '../utils/warning';

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

	// Tracks accepted registrations so duplicates can be rejected (with a dev
	// warning) without putting side effects inside the state updater.
	const registeredValues = useRef( new Set< string >() );

	const registerStep = useCallback( ( meta: T ) => {
		if ( registeredValues.current.has( meta.value ) ) {
			warning(
				`[Stepper] Two steps share value '${ meta.value }'. Each step must have a unique value.`
			);
			// Rejected duplicate: deregistering it must not affect the original.
			return () => {};
		}
		registeredValues.current.add( meta.value );
		setSteps( ( prev ) => [ ...prev, meta ] );

		return () => {
			registeredValues.current.delete( meta.value );
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
