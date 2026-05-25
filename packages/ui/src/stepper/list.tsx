// packages/ui/src/stepper/list.tsx
import { Tabs } from '@base-ui/react/tabs';
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import { useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, ReactNode } from 'react';

type StepperListProps = ComponentProps< 'div' > & {
	children: ReactNode;
	className?: string;
};

export const StepperList = forwardRef< HTMLDivElement, StepperListProps >( function StepperList(
	{ children, className, ...props },
	ref
) {
	const { orientation, activationMode } = useStepperContext();

	if ( process.env.NODE_ENV !== 'production' ) {
		if ( orientation !== 'horizontal' ) {
			// eslint-disable-next-line no-console
			console.warn( '[Stepper] Stepper.List is only used in horizontal mode. It will be ignored.' );
		}
	}

	if ( orientation !== 'horizontal' ) {
		return null;
	}

	return (
		<Tabs.List
			ref={ ref }
			activateOnFocus={ activationMode === 'auto' }
			className={ clsx( styles[ 'list' ], className ) }
			{ ...props }
		>
			{ children }
		</Tabs.List>
	);
} );
