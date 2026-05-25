// packages/ui/src/horizontal-stepper/horizontal-stepper.tsx
import { forwardRef, useCallback, useState } from '@wordpress/element';
import { Stepper } from '../stepper';
import {
	HorizontalStepRegistrationContext,
	HorizontalStepperStep,
	type HorizontalStepRecord,
} from './horizontal-stepper-step';
import styles from './style.module.scss';
import type { StepperProps, StepperRef } from '../stepper/types';
import type { Ref } from 'react';

function HorizontalStepperInner(
	{ children, className, ...props }: StepperProps,
	ref: Ref< StepperRef >
) {
	const [ steps, setSteps ] = useState< HorizontalStepRecord[] >( [] );

	const registerStep = useCallback( ( record: HorizontalStepRecord ) => {
		setSteps( ( prev ) => {
			if ( prev.some( ( s ) => s.value === record.value ) ) {
				return prev;
			}
			return [ ...prev, record ];
		} );
		return () => {
			setSteps( ( prev ) => prev.filter( ( s ) => s.value !== record.value ) );
		};
	}, [] );

	const updateStep = useCallback( ( record: HorizontalStepRecord ) => {
		setSteps( ( prev ) => {
			const idx = prev.findIndex( ( s ) => s.value === record.value );
			if ( idx === -1 || prev[ idx ] === record ) {
				return prev;
			}
			const next = [ ...prev ];
			next[ idx ] = record;
			return next;
		} );
	}, [] );

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
				className={ className ?? styles[ 'root' ] }
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
							className={ styles[ 'step' ] }
						>
							<Stepper.Trigger className={ styles[ 'trigger' ] }>
								<Stepper.Indicator>{ step.indicator }</Stepper.Indicator>
								<div className={ styles[ 'trigger-text' ] }>
									<Stepper.Title>{ step.title }</Stepper.Title>
									{ step.description && (
										<Stepper.Description>{ step.description }</Stepper.Description>
									) }
								</div>
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

const HorizontalStepperBase = forwardRef< StepperRef, StepperProps >( HorizontalStepperInner );

export const HorizontalStepper = Object.assign( HorizontalStepperBase, {
	Step: HorizontalStepperStep,
} );
