import clsx from 'clsx';
import styles from './style.module.scss';
import type { StepperTitleProps } from './types';

export function StepperTitle( { children, className, ...props }: StepperTitleProps ) {
	return (
		<span className={ clsx( styles.title, className ) } { ...props }>
			{ children }
		</span>
	);
}

StepperTitle.displayName = 'Stepper.Title';
