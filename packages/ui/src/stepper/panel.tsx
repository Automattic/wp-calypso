// packages/ui/src/stepper/panel.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import { forwardRef, useContext } from '@wordpress/element';
import clsx from 'clsx';
import { StepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, ReactNode } from 'react';

type StepperPanelProps = ComponentProps< 'div' > & {
	/** Required in horizontal mode to associate panel with a step */
	value?: string;
	/** Keep panel mounted when inactive (horizontal only) */
	forceMount?: boolean;
	children: ReactNode;
	className?: string;
};

export const StepperPanel = forwardRef< HTMLDivElement, StepperPanelProps >( function StepperPanel(
	{ value: valueProp, forceMount, children, className, ...props },
	ref
) {
	const { orientation, totalSteps } = useStepperContext();

	// In vertical mode, value comes from StepContext (we're inside a Step).
	// In horizontal mode, value is passed explicitly.
	// useContext (not useStepContext) to avoid throwing when used outside a Step.
	const stepCtx = useContext( StepContext );
	const resolvedValue = valueProp ?? stepCtx?.value;

	// In vertical mode, Accordion.Panel associates with the trigger via DOM nesting
	// inside Accordion.Item (rendered by Stepper.Step). resolvedValue is only
	// needed for the horizontal Tabs.Panel path.

	if ( process.env.NODE_ENV !== 'production' ) {
		if ( orientation === 'horizontal' && ! resolvedValue ) {
			// eslint-disable-next-line no-console
			console.warn(
				"[Stepper] Stepper.Panel requires a 'value' prop in horizontal mode to associate it with a step."
			);
		}
	}

	if ( orientation === 'vertical' ) {
		// Apply role="region" only when step count is small enough to avoid landmark noise
		const useRegion = totalSteps > 0 && totalSteps <= 5;

		return (
			<Accordion.Panel
				ref={ ref }
				keepMounted={ forceMount }
				role={ useRegion ? 'region' : undefined }
				className={ clsx( styles[ 'panel' ], className ) }
				{ ...props }
			>
				{ children }
			</Accordion.Panel>
		);
	}

	// Horizontal: Tabs.Panel
	return (
		<Tabs.Panel
			ref={ ref }
			value={ resolvedValue }
			keepMounted={ forceMount }
			className={ clsx( styles[ 'panel' ], className ) }
			{ ...props }
		>
			{ children }
		</Tabs.Panel>
	);
} );
