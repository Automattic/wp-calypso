import { check, error } from '@wordpress/icons';
import clsx from 'clsx';
import { Icon } from '../icon';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { StepperIndicatorProps } from './types';

export function StepperIndicator( { children, className }: StepperIndicatorProps ) {
	const { formatStepLabel } = useStepperContext();
	const { index, totalSteps, isCurrent, status } = useStepContext();

	// 1-based step number for display and accessible label.
	const stepNumber = index + 1;
	const accessibleLabel = formatStepLabel( stepNumber, totalSteps, status );

	const hasCustomContent = children !== undefined;

	let defaultContent: React.ReactNode;
	if ( status === 'completed' ) {
		defaultContent = <Icon icon={ check } size={ 16 } />;
	} else if ( status === 'error' ) {
		defaultContent = <Icon icon={ error } size={ 16 } />;
	} else {
		defaultContent = stepNumber;
	}

	return (
		<span
			className={ clsx(
				styles.indicator,
				{
					[ styles[ 'indicator--current' ] ]: isCurrent,
					[ styles[ 'indicator--completed' ] ]: status === 'completed',
					[ styles[ 'indicator--error' ] ]: status === 'error',
				},
				className
			) }
		>
			{ /* Visually-hidden accessible label — always present. */ }
			<span className={ styles[ 'indicator__sr-label' ] }>{ accessibleLabel }</span>

			{ hasCustomContent ? (
				<span aria-hidden="true">{ children }</span>
			) : (
				<span aria-hidden="true" className={ styles[ 'indicator__visual' ] }>
					{ defaultContent }
				</span>
			) }
		</span>
	);
}

StepperIndicator.displayName = 'Stepper.Indicator';
