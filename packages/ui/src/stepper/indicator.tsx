// packages/ui/src/stepper/indicator.tsx
import { check } from '@wordpress/icons';
import { Path, SVG } from '@wordpress/primitives';
import clsx from 'clsx';
import { Icon } from '../icon';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ReactNode } from 'react';

// Half-circle (dome) icon for the bullet-variant current step.
// 12×12 viewBox, dome in the bottom half: flat edge at vertical midpoint (y=6),
// arc curving down to y=12. When centred inside the 24px indicator the flat
// edge sits exactly on the horizontal centre line of the circle.
const halfCircleIcon = (
	<SVG
		width="10"
		height="10"
		viewBox="0 0 10 10"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		style={ { transform: 'rotate(180deg)' } }
	>
		<Path d="M0 5a5 5 0 0 1 10 0H0z" fill="currentColor" />
	</SVG>
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
		indicator = <Icon icon={ check } size={ 14 } />;
	} else if ( status === 'error' ) {
		indicator = <span aria-hidden="true">!</span>;
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
