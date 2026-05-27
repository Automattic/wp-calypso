// packages/ui/src/horizontal-stepper/horizontal-stepper-step.tsx
import { createContext, useContext, useEffect } from '@wordpress/element';
import type { StepStatus } from '../stepper/types';
import type { ReactNode } from 'react';

export type HorizontalStepRecord = {
	value: string;
	title: string;
	description?: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	indicator?: ReactNode;
	forceMount?: boolean;
	children: ReactNode;
	className?: string;
};

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

	// Register on mount, deregister on unmount
	useEffect( () => {
		return registerStep( props );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ props.value ] );

	// Keep all metadata in sync (including ReactNode props).
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
