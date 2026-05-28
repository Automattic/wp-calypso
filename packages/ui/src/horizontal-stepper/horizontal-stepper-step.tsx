// packages/ui/src/horizontal-stepper/horizontal-stepper-step.tsx
import { createContext, useContext, useEffect, useLayoutEffect } from '@wordpress/element';
import type { StepProps } from '../stepper/types';

export type HorizontalStepRecord = StepProps;

type HorizontalStepRegistration = {
	registerStep: ( record: HorizontalStepRecord ) => () => void;
	updateStep: ( record: HorizontalStepRecord ) => void;
};

export const HorizontalStepRegistrationContext = createContext< HorizontalStepRegistration | null >(
	null
);

type HorizontalStepperStepProps = HorizontalStepRecord;

/**
 * Registers step metadata and panel content with HorizontalStepper.
 * Renders nothing itself — HorizontalStepper handles DOM output.
 */
export function HorizontalStepperStep( props: HorizontalStepperStepProps ) {
	const ctx = useContext( HorizontalStepRegistrationContext );
	if ( ! ctx ) {
		throw new Error( 'HorizontalStepper.Step must be used inside <HorizontalStepper>.' );
	}

	const { registerStep, updateStep } = ctx;

	// Register on mount, deregister on unmount.
	// useLayoutEffect ensures registration happens before first browser paint.
	useLayoutEffect( () => {
		return registerStep( props );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ props.value ] );

	// Keep all metadata in sync (including ReactNode props).
	// useEffect (not useLayoutEffect) is intentional: syncing metadata after
	// commit does not affect the initial render. The redundant call on first
	// mount is harmless — updateStep is a no-op when props have not changed.
	// updateStep is defined in HorizontalStepper (stable identity), so adding
	// children/indicator here does not cause an infinite re-render loop.
	useEffect( () => {
		updateStep( props );
	}, [
		updateStep,
		props.value,
		props.title,
		props.description,
		props.status,
		props.optional,
		props.disabled,
		props.forceMount,
		props.className,
		props.children,
		props.indicator,
	] );

	return null;
}
