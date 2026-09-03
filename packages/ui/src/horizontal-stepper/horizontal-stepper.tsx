// packages/ui/src/horizontal-stepper/horizontal-stepper.tsx
import { Children, forwardRef, isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { Stepper } from '../stepper';
import { HorizontalStepperStep, type HorizontalStepperStepProps } from './horizontal-stepper-step';
import styles from './style.module.scss';
import type { AriaLabelXOR, StepperBaseProps, StepperRef } from '../stepper/types';
import type { ReactNode, Ref } from 'react';

// Omit is applied to StepperBaseProps (a plain object type) before intersecting
// with AriaLabelXOR so that the XOR union constraint is preserved. Applying
// Omit directly to StepperProps (which is StepperBaseProps & AriaLabelXOR)
// flattens the union and widens aria-label/aria-labelledby to string|undefined,
// breaking TypeScript's ability to verify the constraint downstream.
type HorizontalStepperProps = Omit< StepperBaseProps, 'headingLevel' > & AriaLabelXOR;

/**
 * Extracts step descriptors from children at render time.
 * Only direct HorizontalStepperStep children are collected — deeply nested
 * or wrapped steps are not supported (use Stepper primitives for those).
 */
function getStepperSteps( children: ReactNode ): HorizontalStepperStepProps[] {
	const steps: HorizontalStepperStepProps[] = [];
	Children.forEach( children, ( child ) => {
		if ( isValidElement( child ) && child.type === HorizontalStepperStep ) {
			steps.push( child.props as HorizontalStepperStepProps );
		}
	} );
	return steps;
}

function HorizontalStepperInner(
	{ children, className, ...props }: HorizontalStepperProps,
	ref: Ref< StepperRef >
) {
	const steps = getStepperSteps( children );

	return (
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
					keepMounted={ step.keepMounted }
					className={ styles[ 'panel' ] }
				>
					{ step.children }
				</Stepper.Panel>
			) ) }
		</Stepper.Root>
	);
}

const HorizontalStepperBase = forwardRef< StepperRef, HorizontalStepperProps >(
	HorizontalStepperInner
);

export const HorizontalStepper = Object.assign( HorizontalStepperBase, {
	Step: HorizontalStepperStep,
} );
