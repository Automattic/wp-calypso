// packages/ui/src/stepper/step.tsx
import { Accordion } from '@base-ui/react/accordion';
import { forwardRef, useContext, useEffect } from '@wordpress/element';
import { StepContext, StepperContext } from './context';
import type { StepContextValue, StepStatus } from './types';

type StepperStepProps = {
	value: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
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

	// Compute derived state
	const isCurrent = value === activeValue;
	const index = steps.findIndex( ( s ) => s.value === value );

	// Linear flow: a step is navigable only if it's current or completed.
	// Explicit disabled always takes priority.
	const isLinearDisabled = linear && ! isCurrent && status !== 'completed';
	const isDisabled = disabledProp || isLinearDisabled;

	// Register this step with Root on mount
	useEffect( () => {
		return registerStep( { value, status, disabled: isDisabled } );
		// Only re-register when identity changes, not on every render
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ value ] );

	// Keep registration metadata in sync without remounting
	useEffect( () => {
		updateStep( { value, status, disabled: isDisabled } );
	}, [ value, status, isDisabled, updateStep ] );

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
