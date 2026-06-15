import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { warning } from '../utils/warning';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Instance< T > = { id: string; meta: T };

/**
 * Maintains an ordered list of registered steps for any record type that
 * includes a `value` string. Registration order is the sole source of truth
 * for index and counting.
 *
 * Registrations are keyed by a unique per-mount `id` (not `value`), so each
 * mounted instance owns its own metadata. The public `steps` list is derived
 * with one entry per `value`, taken from the first still-mounted instance —
 * this means a duplicate value never overrides or leaves stale metadata on the
 * surviving step. Duplicate values are still a dev error and emit a warning.
 *
 * Used by Stepper.Root (with StepMeta) to maintain step order and metadata.
 */
export function useStepRegistration< T extends { value: string } >() {
	const [ instances, setInstances ] = useState< Instance< T >[] >( [] );

	// Per-value mount count, used only to warn on duplicate values without
	// reaching into the (pure) state updater.
	const mountCounts = useRef( new Map< string, number >() );

	const registerStep = useCallback( ( id: string, meta: T ) => {
		const counts = mountCounts.current;
		const count = counts.get( meta.value ) ?? 0;
		counts.set( meta.value, count + 1 );
		if ( count > 0 ) {
			warning(
				`[Stepper] Two steps share value '${ meta.value }'. Each step must have a unique value.`
			);
		}
		setInstances( ( prev ) => [ ...prev, { id, meta } ] );

		return () => {
			const remaining = ( counts.get( meta.value ) ?? 1 ) - 1;
			if ( remaining > 0 ) {
				counts.set( meta.value, remaining );
			} else {
				counts.delete( meta.value );
			}
			setInstances( ( prev ) => prev.filter( ( inst ) => inst.id !== id ) );
		};
	}, [] );

	const updateStep = useCallback( ( id: string, meta: T ) => {
		setInstances( ( prev ) => {
			const idx = prev.findIndex( ( inst ) => inst.id === id );
			if ( idx === -1 ) {
				return prev;
			}
			const existing = prev[ idx ].meta;
			// Plain shallow compare. The key-count check catches fields present
			// in existing but absent from meta (e.g. a removed `status`).
			const metaKeys = Object.keys( meta ) as ( keyof T )[];
			const isUnchanged =
				Object.keys( existing ).length === metaKeys.length &&
				metaKeys.every( ( k ) => existing[ k ] === meta[ k ] );
			if ( isUnchanged ) {
				return prev;
			}
			return prev.map( ( inst ) => ( inst.id === id ? { id, meta } : inst ) );
		} );
	}, [] );

	// One step per value, taken from the first still-mounted instance and
	// ordered by that value's first appearance in registration order. Memoised
	// so a no-op update (which leaves `instances` referentially stable) keeps
	// the same `steps` reference.
	const steps = useMemo( () => {
		const seen = new Set< string >();
		const result: T[] = [];
		for ( const inst of instances ) {
			if ( seen.has( inst.meta.value ) ) {
				continue;
			}
			seen.add( inst.meta.value );
			result.push( inst.meta );
		}
		return result;
	}, [ instances ] );

	return { steps, registerStep, updateStep };
}
