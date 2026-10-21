// packages/ui/src/stepper/indicator.tsx
import { forwardRef } from '@wordpress/element';
import { check } from '@wordpress/icons';
import { Path, SVG } from '@wordpress/primitives';
import { Icon, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, ReactNode } from 'react';

// Half-circle (dome) icon for the bullet-variant current step.
// 10×10 viewBox, dome in the bottom half: flat edge at vertical midpoint (y=5),
// arc curving down to y=10. When centred inside the 18px indicator the flat
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

type StepperIndicatorProps = ComponentProps< 'span' > & {
	children?: ReactNode;
};

export const StepperIndicator = forwardRef< HTMLSpanElement, StepperIndicatorProps >(
	function StepperIndicator( { children, className, ...props }, ref ) {
		const { index, totalSteps, isCurrent, status, isDisabled } = useStepContext();
		const { formatStepLabel, indicatorVariant } = useStepperContext();

		const stepNumber = index + 1;
		// totalSteps is 0 on the initial render before step registration fires.
		// Guard to avoid announcing "Step 1 of 0" to screen readers.
		const accessibleLabel =
			totalSteps > 0 ? formatStepLabel( stepNumber, totalSteps, status ) : null;

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
				ref={ ref }
				{ ...props }
				data-indicator-variant={ indicatorVariant }
				className={ clsx( styles.indicator, className, {
					[ styles[ 'is-current' ] ]: isCurrent,
					[ styles[ 'is-completed' ] ]: status === 'completed',
					[ styles[ 'is-error' ] ]: status === 'error',
					[ styles[ 'is-disabled' ] ]: isDisabled,
				} ) }
			>
				{ accessibleLabel && (
					<VisuallyHidden render={ <span /> }>{ accessibleLabel }</VisuallyHidden>
				) }

				{ /* Visual content */ }
				{ children ? <span aria-hidden="true">{ children }</span> : indicator }
			</span>
		);
	}
);
