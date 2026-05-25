// packages/ui/src/stepper/description.tsx
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import styles from './style.module.scss';
import type { ComponentProps } from 'react';

export const StepperDescription = forwardRef< HTMLSpanElement, ComponentProps< 'span' > >(
	function StepperDescription( { children, className, ...props }, ref ) {
		return (
			<span ref={ ref } className={ clsx( styles.description, className ) } { ...props }>
				{ children }
			</span>
		);
	}
);
