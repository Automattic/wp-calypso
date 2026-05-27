import { useCallback, useState } from '@wordpress/element';
import type { StepMeta } from './types';

/**
 * Used by Stepper.Root to maintain an ordered list of registered steps.
 * Steps register on mount and deregister on unmount.
 * Registration order is the sole source of truth for index and counting.
 */
export function useStepRegistration() {
	const [ steps, setSteps ] = useState< StepMeta[] >( [] );

	const registerStep = useCallback( ( meta: StepMeta ) => {
		setSteps( ( prev ) => {
			// Avoid duplicate registration (React StrictMode double-invocation)
			if ( prev.some( ( s ) => s.value === meta.value ) ) {
				return prev;
			}
			return [ ...prev, meta ];
		} );

		return () => {
			setSteps( ( prev ) => prev.filter( ( s ) => s.value !== meta.value ) );
		};
	}, [] );

	const updateStep = useCallback( ( meta: StepMeta ) => {
		setSteps( ( prev ) => {
			const idx = prev.findIndex( ( s ) => s.value === meta.value );
			if ( idx === -1 || prev[ idx ] === meta ) {
				return prev;
			}
			return prev.map( ( s ) => ( s.value === meta.value ? meta : s ) );
		} );
	}, [] );

	return { steps, registerStep, updateStep };
}
