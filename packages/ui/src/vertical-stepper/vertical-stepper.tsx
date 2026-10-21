// packages/ui/src/vertical-stepper/vertical-stepper.tsx
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import { Stepper } from '../stepper';
import styles from './style.module.scss';
import { VerticalStepperStep } from './vertical-stepper-step';
import type { AriaLabelXOR, StepperBaseProps, StepperRef } from '../stepper/types';
import type { Ref } from 'react';

type VerticalStepperProps = Omit< StepperBaseProps, 'activationMode' > & AriaLabelXOR;

function VerticalStepperInner(
	{ children, className, ...props }: VerticalStepperProps,
	ref: Ref< StepperRef >
) {
	return (
		<Stepper.Root
			orientation="vertical"
			ref={ ref }
			className={ clsx( styles[ 'root' ], className ) }
			{ ...props }
		>
			{ children }
		</Stepper.Root>
	);
}

const VerticalStepperBase = forwardRef< StepperRef, VerticalStepperProps >( VerticalStepperInner );

export const VerticalStepper = Object.assign( VerticalStepperBase, {
	Step: VerticalStepperStep,
} );
