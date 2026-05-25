import { DisclosureProvider } from '@ariakit/react/disclosure';
import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { StepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { StepContextValue, StepperStepProps } from './types';

export function StepperStep( {
	value,
	status,
	optional = false,
	disabled = false,
	children,
	className,
}: StepperStepProps ) {
	const {
		orientation,
		value: activeValue,
		onValueChange,
		linear,
		steps,
		registerStep,
	} = useStepperContext();

	// Register this step with the root on mount.
	useEffect( () => {
		return registerStep( { value, status, disabled, optional } );
		// Re-register only if the value identity changes (dynamic steps).
		// status/disabled/optional changes are read directly from props at render time
		// and reflected in stepContext below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ value ] );

	const stepMeta = steps.find( ( s ) => s.value === value );
	const index = stepMeta?.index ?? 0;
	const totalSteps = steps.length;
	const isCurrent = activeValue === value;

	const activeIndex = steps.findIndex( ( s ) => s.value === activeValue );
	const isLinearBlocked = linear && ! isCurrent && status !== 'completed' && index > activeIndex;
	const isDisabled = disabled || isLinearBlocked;

	const stepContext: StepContextValue = {
		value,
		index,
		totalSteps,
		isCurrent,
		status,
		isDisabled,
		optional,
	};

	const dataAttrs = {
		'data-current': isCurrent ? '' : undefined,
		'data-status': status,
		'data-disabled': isDisabled ? '' : undefined,
		'data-optional': optional ? '' : undefined,
	};

	const stepEl = (
		<StepContext.Provider value={ stepContext }>
			<div className={ clsx( styles.step, className ) } { ...dataAttrs }>
				{ children }
			</div>
		</StepContext.Provider>
	);

	// Vertical: each step owns a DisclosureProvider to manage expand/collapse.
	if ( orientation === 'vertical' ) {
		return (
			<DisclosureProvider
				open={ isCurrent }
				setOpen={ ( open: boolean ) => {
					if ( open && ! isDisabled ) {
						onValueChange( value );
					}
				} }
			>
				{ stepEl }
			</DisclosureProvider>
		);
	}

	// Horizontal: step context only; the TabProvider in Root manages tab state.
	return stepEl;
}

StepperStep.displayName = 'Stepper.Step';
