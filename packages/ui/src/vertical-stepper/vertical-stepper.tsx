import { Children, forwardRef, isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { StepperDescription } from '../stepper/description';
import { StepperIndicator } from '../stepper/indicator';
import { StepperPanel } from '../stepper/panel';
import { StepperRoot } from '../stepper/root';
import { StepperStep } from '../stepper/step';
import { StepperTitle } from '../stepper/title';
import { StepperTrigger } from '../stepper/trigger';
import styles from './style.module.scss';
import { VerticalStepperStep } from './vertical-stepper-step';
import type { VerticalStepperStepProps } from './vertical-stepper-step';
import type { StepperProps, StepperRef } from '../stepper/types';

export const VerticalStepper = Object.assign(
	forwardRef< StepperRef, StepperProps >( function VerticalStepper(
		{ children, className, ...props },
		ref
	) {
		const steps = Children.toArray( children ).filter(
			( child ): child is React.ReactElement< VerticalStepperStepProps > =>
				isValidElement( child ) &&
				( child.type as { displayName?: string } ).displayName === 'VerticalStepper.Step'
		);

		return (
			<StepperRoot
				{ ...props }
				orientation="vertical"
				ref={ ref }
				className={ clsx( styles.root, className ) }
			>
				{ steps.map( ( step ) => {
					const {
						value,
						title,
						description,
						status,
						optional,
						disabled,
						indicator,
						forceMount,
						children: panelContent,
						className: stepClassName,
					} = step.props;

					return (
						<StepperStep
							key={ value }
							value={ value }
							status={ status }
							optional={ optional }
							disabled={ disabled }
							className={ stepClassName }
						>
							<StepperTrigger>
								{ indicator !== undefined ? (
									<StepperIndicator>{ indicator }</StepperIndicator>
								) : (
									<StepperIndicator />
								) }
								<span className={ styles[ 'step-text' ] }>
									<StepperTitle>{ title }</StepperTitle>
									{ description && <StepperDescription>{ description }</StepperDescription> }
								</span>
							</StepperTrigger>
							<StepperPanel forceMount={ forceMount }>{ panelContent }</StepperPanel>
						</StepperStep>
					);
				} ) }
			</StepperRoot>
		);
	} ),
	{ Step: VerticalStepperStep }
);

VerticalStepper.displayName = 'VerticalStepper';
