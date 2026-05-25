import { createContext, useCallback, useContext, useReducer } from '@wordpress/element';
import type { StepContextValue, StepMeta, StepStatus, StepperContextValue } from './types';

// ─── Stepper root context ────────────────────────────────────────────────────

export const StepperContext = createContext< StepperContextValue | null >( null );

export function useStepperContext(): StepperContextValue {
	const ctx = useContext( StepperContext );
	if ( ! ctx ) {
		throw new Error( 'Stepper components must be rendered inside Stepper.Root.' );
	}
	return ctx;
}

// ─── Per-step context ────────────────────────────────────────────────────────

export const StepContext = createContext< StepContextValue | null >( null );

export function useStepContext(): StepContextValue {
	const ctx = useContext( StepContext );
	if ( ! ctx ) {
		throw new Error( 'Stepper sub-components must be rendered inside Stepper.Step.' );
	}
	return ctx;
}

// ─── Step registration reducer ───────────────────────────────────────────────

type RegisterAction = { type: 'register'; meta: Omit< StepMeta, 'index' > };
type UnregisterAction = { type: 'unregister'; value: string };
type UpdateAction = { type: 'update'; meta: Omit< StepMeta, 'index' > };

type StepsAction = RegisterAction | UnregisterAction | UpdateAction;

function stepsReducer( state: StepMeta[], action: StepsAction ): StepMeta[] {
	switch ( action.type ) {
		case 'register': {
			if ( state.some( ( s ) => s.value === action.meta.value ) ) {
				// Already registered (e.g. Strict Mode double-mount); skip.
				return state;
			}
			return [ ...state, { ...action.meta, index: state.length } ];
		}
		case 'unregister': {
			const next = state.filter( ( s ) => s.value !== action.value );
			return next.map( ( s, i ) => ( { ...s, index: i } ) );
		}
		case 'update': {
			return state.map( ( s ) => ( s.value === action.meta.value ? { ...s, ...action.meta } : s ) );
		}
	}
}

/** Returns a stable registerStep function and the current ordered steps array. */
export function useStepRegistry(): {
	steps: StepMeta[];
	registerStep: ( meta: Omit< StepMeta, 'index' > ) => () => void;
} {
	const [ steps, dispatch ] = useReducer( stepsReducer, [] );

	const registerStep = useCallback( ( meta: Omit< StepMeta, 'index' > ): ( () => void ) => {
		dispatch( { type: 'register', meta } );
		return () => dispatch( { type: 'unregister', value: meta.value } );
	}, [] );

	return { steps, registerStep };
}

// ─── Default formatStepLabel ─────────────────────────────────────────────────

export function defaultFormatStepLabel( step: number, total: number, status?: StepStatus ): string {
	let label = `Step ${ step } of ${ total }`;
	if ( status === 'completed' ) {
		label += ', completed';
	}
	if ( status === 'error' ) {
		label += ', error';
	}
	return label;
}
