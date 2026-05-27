// packages/ui/src/vertical-stepper/vertical-stepper-step.tsx
import { Stepper } from '../stepper';
import styles from './style.module.scss';
import type { StepProps } from '../stepper/types';

/**
 * A single step in a VerticalStepper.
 * Renders as Stepper.Step > Stepper.Trigger + Stepper.Panel (accordion pattern).
 */
export function VerticalStepperStep( {
	value,
	title,
	description,
	status,
	optional = false,
	disabled = false,
	indicator,
	forceMount,
	children,
	className,
}: StepProps ) {
	return (
		<Stepper.Step
			value={ value }
			status={ status }
			optional={ optional }
			disabled={ disabled }
			className={ className ?? styles[ 'step' ] }
		>
			<Stepper.Trigger className={ styles[ 'trigger' ] }>
				<Stepper.Indicator>{ indicator }</Stepper.Indicator>
				<div className={ styles[ 'trigger-text' ] }>
					<Stepper.Title>{ title }</Stepper.Title>
					{ description && <Stepper.Description>{ description }</Stepper.Description> }
					{ optional && ! description && <Stepper.Description>Optional</Stepper.Description> }
				</div>
			</Stepper.Trigger>
			<Stepper.Panel className={ styles[ 'panel' ] } forceMount={ forceMount }>
				{ children }
			</Stepper.Panel>
		</Stepper.Step>
	);
}
