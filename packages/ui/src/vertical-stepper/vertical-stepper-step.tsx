// packages/ui/src/vertical-stepper/vertical-stepper-step.tsx
import { __ } from '@wordpress/i18n';
import { Stack } from '@wordpress/ui';
import clsx from 'clsx';
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
	keepMounted,
	children,
	className,
}: StepProps ) {
	return (
		<Stepper.Step
			value={ value }
			status={ status }
			optional={ optional }
			disabled={ disabled }
			className={ clsx( styles[ 'step' ], className ) }
		>
			<Stepper.Trigger className={ styles[ 'trigger' ] }>
				<span className={ styles[ 'indicator-wrapper' ] }>
					<Stepper.Indicator>{ indicator }</Stepper.Indicator>
				</span>
				<Stack direction="column" gap="xs">
					<Stepper.Title>{ title }</Stepper.Title>
					{ description && <Stepper.Description>{ description }</Stepper.Description> }
					{ optional && ! description && (
						<Stepper.Description>{ __( 'Optional' ) }</Stepper.Description>
					) }
				</Stack>
			</Stepper.Trigger>
			<Stepper.Panel className={ styles[ 'panel' ] } keepMounted={ keepMounted }>
				<div className={ styles[ 'panel-content' ] }>{ children }</div>
			</Stepper.Panel>
		</Stepper.Step>
	);
}
