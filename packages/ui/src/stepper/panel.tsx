// packages/ui/src/stepper/panel.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import { forwardRef, useContext, useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { warning } from '../utils/warning';
import { StepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { StepperPanelProps } from './types';

export const StepperPanel = forwardRef< HTMLDivElement, StepperPanelProps >( function StepperPanel(
	{ value: valueProp, keepMounted, children, className, ...props },
	ref
) {
	const { orientation, totalSteps, steps } = useStepperContext();

	// In vertical mode, value comes from StepContext (we're inside a Step).
	// In horizontal mode, value is passed explicitly.
	// useContext (not useStepContext) to avoid throwing when used outside a Step.
	const stepCtx = useContext( StepContext );
	const resolvedValue = valueProp ?? stepCtx?.value;

	// In vertical mode, Accordion.Panel associates with the trigger via DOM nesting
	// inside Accordion.Item (rendered by Stepper.Step). resolvedValue is only
	// needed for the horizontal Tabs.Panel path.

	// Warn from an effect (not during render) to stay safe under Concurrent Mode.
	useEffect( () => {
		if ( orientation === 'horizontal' && ! resolvedValue ) {
			warning(
				"[Stepper] Stepper.Panel requires a 'value' prop in horizontal mode to associate it with a step."
			);
		}
		if ( resolvedValue && steps.length > 0 && ! steps.some( ( s ) => s.value === resolvedValue ) ) {
			warning( `[Stepper] No step found with value '${ resolvedValue }' for this Panel.` );
		}
	}, [ orientation, resolvedValue, steps ] );

	if ( orientation === 'vertical' ) {
		// Apply role="region" only when step count is small enough to avoid landmark noise.
		// Passing role={undefined} intentionally overrides base-ui's internal role="region":
		// base-ui's mergeProps applies elementProps last ("external props take precedence"),
		// so role={undefined} wins and React omits the attribute from the DOM.
		const useRegion = totalSteps > 0 && totalSteps <= 5;

		return (
			<Accordion.Panel
				ref={ ref }
				keepMounted={ keepMounted }
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
			keepMounted={ keepMounted }
			className={ clsx( styles[ 'panel' ], className ) }
			{ ...props }
		>
			{ children }
		</Tabs.Panel>
	);
} );
