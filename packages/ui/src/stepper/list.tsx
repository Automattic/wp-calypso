// packages/ui/src/stepper/list.tsx
import { Tabs } from '@base-ui/react/tabs';
import { forwardRef, useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { warning } from '../utils/warning';
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
	const isHorizontal = orientation === 'horizontal';

	// Warn from an effect (not during render) to stay safe under Concurrent Mode.
	useEffect( () => {
		if ( ! isHorizontal ) {
			warning( '[Stepper] Stepper.List is only used in horizontal mode. It will be ignored.' );
		}
	}, [ isHorizontal ] );

	if ( ! isHorizontal ) {
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
