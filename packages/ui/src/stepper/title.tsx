// packages/ui/src/stepper/title.tsx
import { forwardRef } from '@wordpress/element';
import { Text } from '@wordpress/ui';
import clsx from 'clsx';
import styles from './style.module.scss';
import type { ComponentProps } from 'react';

export const StepperTitle = forwardRef< HTMLSpanElement, ComponentProps< 'span' > >(
	function StepperTitle( { children, className, ...props }, ref ) {
		return (
			<Text
				ref={ ref }
				variant="body-md"
				className={ clsx( styles.title, className ) }
				{ ...props }
			>
				{ children }
			</Text>
		);
	}
);
