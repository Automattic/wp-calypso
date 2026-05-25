// packages/ui/src/stepper/title.tsx
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import styles from './style.module.scss';
import type { ComponentProps } from 'react';

export const StepperTitle = forwardRef< HTMLSpanElement, ComponentProps< 'span' > >(
	function StepperTitle( { children, className, ...props }, ref ) {
		return (
			<span ref={ ref } className={ clsx( styles.title, className ) } { ...props }>
				{ children }
			</span>
		);
	}
);
