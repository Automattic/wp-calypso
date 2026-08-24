// packages/ui/src/stepper/step.tsx
import { Accordion } from '@base-ui/react/accordion';
import { forwardRef, useContext, useEffect, useId, useLayoutEffect } from '@wordpress/element';
import { StepContext, StepperContext } from './context';
import type { StepContextValue, StepStatus } from './types';
import type { ReactNode } from 'react';

type StepperStepProps = {
	value: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	children: ReactNode;
	className?: string;
};

export const StepperStep = forwardRef< HTMLDivElement, StepperStepProps >( function StepperStep(
	{ value, status, optional = false, disabled: disabledProp = false, children, className },
	ref
) {
	const rootCtx = useContext( StepperContext );
	if ( ! rootCtx ) {
		throw new Error( 'Stepper.Step must be used inside <Stepper.Root>.' );
	}

	const {
		value: activeValue,
		linear,
		steps,
		totalSteps,
		registerStep,
		updateStep,
		orientation,
	} = rootCtx;

	// Stable per-mount id so each instance owns its own registration, even when
	// two steps transiently share the same `value`.
	const id = useId();

	// Compute derived state
	const isCurrent = value === activeValue;
	const index = steps.findIndex( ( s ) => s.value === value );

	// Linear flow: a step is navigable only if it's current, completed, or
	// has an error (so users can navigate back to fix a validation failure).
	// Explicit disabled always takes priority.
	const isLinearDisabled = linear && ! isCurrent && status !== 'completed' && status !== 'error';
	const isDisabled = disabledProp || isLinearDisabled;

	// Register on mount with real metadata; deregister on unmount.
	// useLayoutEffect ensures registration happens before the first browser paint,
	// so totalSteps and index are correct on the first visible render.
	useLayoutEffect( () => {
		const deregister = registerStep( id, { value, status, disabled: isDisabled } );
		return deregister;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ id, value ] );

	// useEffect (not useLayoutEffect) is intentional: syncing metadata after
	// commit does not affect the initial render. The redundant call on first
	// mount is harmless — updateStep is a no-op when props have not changed.
	useEffect( () => {
		updateStep( id, { value, status, disabled: isDisabled } );
	}, [ id, value, status, isDisabled, updateStep ] );

	const stepCtx: StepContextValue = {
		value,
		index: index === -1 ? 0 : index,
		totalSteps,
		isCurrent,
		status,
		isDisabled,
		optional,
	};

	if ( orientation === 'vertical' ) {
		return (
			<StepContext.Provider value={ stepCtx }>
				<Accordion.Item
					ref={ ref }
					value={ value }
					disabled={ isDisabled }
					className={ className }
					data-status={ status }
					data-current={ isCurrent ? '' : undefined }
					data-disabled={ isDisabled ? '' : undefined }
				>
					{ children }
				</Accordion.Item>
			</StepContext.Provider>
		);
	}

	// Horizontal: plain div container
	return (
		<StepContext.Provider value={ stepCtx }>
			<div
				ref={ ref }
				className={ className }
				data-status={ status }
				data-current={ isCurrent ? '' : undefined }
				data-disabled={ isDisabled ? '' : undefined }
			>
				{ children }
			</div>
		</StepContext.Provider>
	);
} );
