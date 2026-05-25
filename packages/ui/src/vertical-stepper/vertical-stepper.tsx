// packages/ui/src/vertical-stepper/vertical-stepper.tsx
import { forwardRef } from '@wordpress/element';
import { Stepper } from '../stepper';
import styles from './style.module.scss';
import { VerticalStepperStep } from './vertical-stepper-step';
import type { StepperProps, StepperRef } from '../stepper/types';
import type { Ref } from 'react';

function VerticalStepperInner(
	{ children, className, ...props }: StepperProps,
	ref: Ref< StepperRef >
) {
	return (
		<Stepper.Root
			orientation="vertical"
			ref={ ref }
			className={ className ?? styles[ 'root' ] }
			{ ...props }
		>
			{ children }
		</Stepper.Root>
	);
}

const VerticalStepperBase = forwardRef< StepperRef, StepperProps >( VerticalStepperInner );

export const VerticalStepper = Object.assign( VerticalStepperBase, {
	Step: VerticalStepperStep,
} );
