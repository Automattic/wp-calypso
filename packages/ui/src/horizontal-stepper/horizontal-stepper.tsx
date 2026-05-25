import { Children, forwardRef, isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { StepperDescription } from '../stepper/description';
import { StepperIndicator } from '../stepper/indicator';
import { StepperList } from '../stepper/list';
import { StepperPanel } from '../stepper/panel';
import { StepperRoot } from '../stepper/root';
import { StepperStep } from '../stepper/step';
import { StepperTitle } from '../stepper/title';
import { StepperTrigger } from '../stepper/trigger';
import { HorizontalStepperStep } from './horizontal-stepper-step';
import styles from './style.module.scss';
import type { HorizontalStepperStepProps } from './horizontal-stepper-step';
import type { StepperProps, StepperRef } from '../stepper/types';

export const HorizontalStepper = Object.assign(
	forwardRef< StepperRef, StepperProps >( function HorizontalStepper(
		{ children, className, ...props },
		ref
	) {
		const steps = Children.toArray( children ).filter(
			( child ): child is React.ReactElement< HorizontalStepperStepProps > =>
				isValidElement( child ) &&
				( child.type as { displayName?: string } ).displayName === 'HorizontalStepper.Step'
		);

		return (
			<StepperRoot
				{ ...props }
				orientation="horizontal"
				ref={ ref }
				className={ clsx( styles.root, className ) }
			>
				{ /* Tab list: all triggers in a row. */ }
				<StepperList className={ styles.list }>
					{ steps.map( ( step ) => {
						const {
							value,
							title,
							description,
							status,
							optional,
							disabled,
							indicator,
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
									<StepperTitle>{ title }</StepperTitle>
									{ description && <StepperDescription>{ description }</StepperDescription> }
								</StepperTrigger>
							</StepperStep>
						);
					} ) }
				</StepperList>

				{ /* Panels rendered below the tab list. */ }
				{ steps.map( ( step ) => {
					const { value, forceMount, children: panelContent } = step.props;
					return (
						<StepperPanel key={ value } value={ value } forceMount={ forceMount }>
							{ panelContent }
						</StepperPanel>
					);
				} ) }
			</StepperRoot>
		);
	} ),
	{ Step: HorizontalStepperStep }
);

HorizontalStepper.displayName = 'HorizontalStepper';
