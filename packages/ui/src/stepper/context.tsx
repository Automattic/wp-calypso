// packages/ui/src/stepper/context.tsx
import { createContext, useContext } from '@wordpress/element';
import type { StepperContextValue, StepContextValue, StepStatus } from './types';

// ---------------------------------------------------------------------------
// Default formatStepLabel
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stepper context (root → all descendants)
// ---------------------------------------------------------------------------

const StepperContext = createContext< StepperContextValue | null >( null );

export function useStepperContext(): StepperContextValue {
	const ctx = useContext( StepperContext );
	if ( ! ctx ) {
		throw new Error( 'Stepper components must be used inside <Stepper.Root>.' );
	}
	return ctx;
}

export { StepperContext };

// ---------------------------------------------------------------------------
// Step context (Stepper.Step → its descendants)
// ---------------------------------------------------------------------------

const StepContext = createContext< StepContextValue | null >( null );

export function useStepContext(): StepContextValue {
	const ctx = useContext( StepContext );
	if ( ! ctx ) {
		throw new Error(
			'Stepper leaf components (Trigger, Panel, Indicator, Title, Description) must be used inside <Stepper.Step>.'
		);
	}
	return ctx;
}

export { StepContext };
