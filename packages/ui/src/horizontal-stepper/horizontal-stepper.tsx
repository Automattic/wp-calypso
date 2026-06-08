// packages/ui/src/horizontal-stepper/horizontal-stepper.tsx
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import { Stepper } from '../stepper';
import { useStepRegistration } from '../stepper/use-step-registration';
import {
	HorizontalStepRegistrationContext,
	HorizontalStepperStep,
	type HorizontalStepRecord,
} from './horizontal-stepper-step';
import styles from './style.module.scss';
import type { AriaLabelXOR, StepperBaseProps, StepperRef } from '../stepper/types';
import type { Ref } from 'react';

// Omit is applied to StepperBaseProps (a plain object type) before intersecting
// with AriaLabelXOR so that the XOR union constraint is preserved. Applying
// Omit directly to StepperProps (which is StepperBaseProps & AriaLabelXOR)
// flattens the union and widens aria-label/aria-labelledby to string|undefined,
// breaking TypeScript's ability to verify the constraint downstream.
type HorizontalStepperProps = Omit< StepperBaseProps, 'headingLevel' > & AriaLabelXOR;

function HorizontalStepperInner(
	{ children, className, ...props }: HorizontalStepperProps,
	ref: Ref< StepperRef >
) {
	const { steps, registerStep, updateStep } = useStepRegistration< HorizontalStepRecord >();

	return (
		<HorizontalStepRegistrationContext.Provider value={ { registerStep, updateStep } }>
			{ /* Hidden render pass — HorizontalStepper.Step components register here */ }
			<div style={ { display: 'none' } } aria-hidden="true">
				{ children }
			</div>

			{ /* Actual rendered output */ }
			<Stepper.Root
				orientation="horizontal"
				ref={ ref }
				className={ clsx( styles[ 'root' ], className ) }
				{ ...props }
			>
				<Stepper.List className={ styles[ 'list' ] }>
					{ steps.map( ( step ) => (
						<Stepper.Step
							key={ step.value }
							value={ step.value }
							status={ step.status }
							optional={ step.optional }
							disabled={ step.disabled }
							className={ clsx( styles[ 'step' ], step.className ) }
						>
							<Stepper.Trigger className={ styles[ 'trigger' ] }>
								<Stepper.Indicator>{ step.indicator }</Stepper.Indicator>
								<Stepper.Title className={ styles[ 'text-block' ] }>{ step.title }</Stepper.Title>
							</Stepper.Trigger>
						</Stepper.Step>
					) ) }
				</Stepper.List>

				{ steps.map( ( step ) => (
					<Stepper.Panel
						key={ step.value }
						value={ step.value }
						forceMount={ step.forceMount }
						className={ styles[ 'panel' ] }
					>
						{ step.children }
					</Stepper.Panel>
				) ) }
			</Stepper.Root>
		</HorizontalStepRegistrationContext.Provider>
	);
}

const HorizontalStepperBase = forwardRef< StepperRef, HorizontalStepperProps >(
	HorizontalStepperInner
);

export const HorizontalStepper = Object.assign( HorizontalStepperBase, {
	Step: HorizontalStepperStep,
} );
