// packages/ui/src/stepper/indicator.tsx
import { forwardRef } from '@wordpress/element';
import { border, caution, drafts, published } from '@wordpress/icons';
import { Icon, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, ReactNode } from 'react';

// State → icon mapping, all standard @wordpress/icons:
// border = dashed circle, drafts = half-filled circle,
// published = circled check, caution = circled exclamation mark.
const STATE_ICONS = {
	upcoming: border,
	current: drafts,
	completed: published,
	error: caution,
} as const;

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

		const state = status ?? ( isCurrent ? 'current' : 'upcoming' );
		// Bullet variant: every state is an icon. Number variant: icons only for
		// completed/error; upcoming/current keep the numbered circle.
		const indicator: ReactNode =
			indicatorVariant === 'bullet' || status ? (
				<Icon icon={ STATE_ICONS[ state ] } />
			) : (
				<span aria-hidden="true">{ stepNumber }</span>
			);

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
