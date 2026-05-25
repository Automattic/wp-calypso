import { TabList } from '@ariakit/react/tab';
import clsx from 'clsx';
import { useStepperContext } from './context';
import styles from './style.module.scss';
import type { StepperListProps } from './types';

export function StepperList( { children, className }: StepperListProps ) {
	const { orientation } = useStepperContext();

	if ( orientation === 'vertical' ) {
		// eslint-disable-next-line no-console
		console.warn( '[Stepper] Stepper.List is only used in horizontal mode. It will be ignored.' );
	}

	return <TabList className={ clsx( styles.list, className ) }>{ children }</TabList>;
}

StepperList.displayName = 'Stepper.List';
