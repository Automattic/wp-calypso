// packages/ui/src/stepper/indicator.tsx
import { check, error as errorIcon } from '@wordpress/icons';
import { Icon } from '@wordpress/ui';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ReactNode } from 'react';

type StepperIndicatorProps = {
	children?: ReactNode;
	className?: string;
};

export function StepperIndicator( { children, className }: StepperIndicatorProps ) {
	const { index, totalSteps, isCurrent, status, isDisabled } = useStepContext();
	const { formatStepLabel } = useStepperContext();

	const stepNumber = index + 1;
	const accessibleLabel = formatStepLabel( stepNumber, totalSteps, status );

	let indicator = <span aria-hidden="true">{ stepNumber }</span>;
	if ( status === 'completed' ) {
		indicator = <Icon icon={ check } size={ 16 } />;
	} else if ( status === 'error' ) {
		indicator = <Icon icon={ errorIcon } size={ 16 } />;
	}

	return (
		<span
			className={ clsx( styles.indicator, className, {
				[ styles[ 'is-current' ] ]: isCurrent,
				[ styles[ 'is-completed' ] ]: status === 'completed',
				[ styles[ 'is-error' ] ]: status === 'error',
				[ styles[ 'is-disabled' ] ]: isDisabled,
			} ) }
		>
			{ /* Visually hidden accessible label — always present */ }
			<span className={ styles[ 'visually-hidden' ] }>{ accessibleLabel }</span>

			{ /* Visual content */ }
			{ children ? <span aria-hidden="true">{ children }</span> : indicator }
		</span>
	);
}
