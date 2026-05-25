import clsx from 'clsx';
import styles from './style.module.scss';
import type { StepperDescriptionProps } from './types';

export function StepperDescription( { children, className, ...props }: StepperDescriptionProps ) {
	return (
		<span className={ clsx( styles.description, className ) } { ...props }>
			{ children }
		</span>
	);
}

StepperDescription.displayName = 'Stepper.Description';
