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

	// Per-value mount count. Only the first registration adds a state entry
	// (duplicates get a dev warning), and the entry is removed only when the
	// last mounted instance deregisters — so transient duplicates (e.g.
	// overlapping conditional renders) never drop a still-mounted step. The
	// ref also keeps the duplicate check and warning outside the state
	// updater, which must stay pure.
	const mountCounts = useRef( new Map< string, number >() );

	const registerStep = useCallback( ( meta: T ) => {
		const counts = mountCounts.current;
		const count = counts.get( meta.value ) ?? 0;
		counts.set( meta.value, count + 1 );
		if ( count > 0 ) {
			warning(
				`[Stepper] Two steps share value '${ meta.value }'. Each step must have a unique value.`
			);
		} else {
			setSteps( ( prev ) => [ ...prev, meta ] );
		}

		return () => {
			const remaining = ( counts.get( meta.value ) ?? 1 ) - 1;
			if ( remaining > 0 ) {
				// A duplicate instance is still mounted, so keep the value
				// registered to protect index/totalSteps. Limitation: `steps`
				// keeps this unmounted instance's metadata and the survivor
				// never re-syncs (its updateStep effect only reacts to its own
				// props), so `status`/`disabled` can render stale until the
				// survivor's props next change. Acceptable since duplicate
				// values are already a warned dev error.
				// TODO: for correct metadata under duplicates, switch to
				// instance-keyed registration (unique id per mount, derive
				// `steps` from the first still-mounted instance per value).
				counts.set( meta.value, remaining );
				return;
			}
			counts.delete( meta.value );
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
			// Plain shallow compare. The key-count check catches fields present
			// in existing but absent from meta (e.g. a removed `status`).
			const metaKeys = Object.keys( meta ) as ( keyof T )[];
			const isUnchanged =
				Object.keys( existing ).length === metaKeys.length &&
				metaKeys.every( ( k ) => existing[ k ] === meta[ k ] );
			if ( isUnchanged ) {
				return prev;
			}
			return prev.map( ( s ) => ( s.value === meta.value ? meta : s ) );
		} );
	}, [] );

	return { steps, registerStep, updateStep };
}
