// packages/ui/src/stepper/indicator.tsx
import { check, error as errorIcon } from '@wordpress/icons';
import { Icon } from '@wordpress/ui';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ReactNode } from 'react';

// Half-circle (dome) icon for the bullet-variant current step
const halfCircleIcon = (
	<svg
		width="12"
		height="6"
		viewBox="0 0 12 6"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M0 0a6 6 0 0 1 12 0H0z" fill="currentColor" />
	</svg>
);

type StepperIndicatorProps = {
	children?: ReactNode;
	className?: string;
};

export function StepperIndicator( { children, className }: StepperIndicatorProps ) {
	const { index, totalSteps, isCurrent, status, isDisabled } = useStepContext();
	const { formatStepLabel, indicatorVariant } = useStepperContext();

	const stepNumber = index + 1;
	const accessibleLabel = formatStepLabel( stepNumber, totalSteps, status );

	let indicator: ReactNode =
		indicatorVariant === 'number' ? <span aria-hidden="true">{ stepNumber }</span> : null;
	if ( status === 'completed' ) {
		indicator = <Icon icon={ check } size={ 16 } />;
	} else if ( status === 'error' ) {
		indicator = <Icon icon={ errorIcon } size={ 16 } />;
	} else if ( isCurrent && indicatorVariant === 'bullet' ) {
		indicator = halfCircleIcon;
	}

	return (
		<span
			data-indicator-variant={ indicatorVariant }
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
