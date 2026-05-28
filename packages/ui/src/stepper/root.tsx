// packages/ui/src/stepper/root.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import clsx from 'clsx';
import { StepperContext, defaultFormatStepLabel } from './context';
import { useStepRegistration } from './use-step-registration';
import type { StepMeta, StepperContextValue, StepperRef, StepperRootProps } from './types';

export const StepperRoot = forwardRef< StepperRef, StepperRootProps >( function StepperRoot(
	{
		orientation,
		value: valueProp,
		defaultValue,
		onValueChange,
		linear = false,
		headingLevel = 3,
		activationMode = 'manual',
		formatStepLabel = defaultFormatStepLabel,
		indicatorVariant = 'bullet',
		children,
		className,
		style,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
	},
	ref
) {
	// Controlled/uncontrolled value
	const [ internalValue, setInternalValue ] = useState< string >( defaultValue ?? '' );
	const isControlled = valueProp !== undefined;
	const value = isControlled ? ( valueProp as string ) : internalValue;

	const handleValueChange = useCallback(
		( next: string ) => {
			if ( ! isControlled ) {
				setInternalValue( next );
			}
			onValueChange?.( next );
		},
		[ isControlled, onValueChange ]
	);

	// Step registration
	const { steps, registerStep, updateStep } = useStepRegistration< StepMeta >();
	const totalSteps = steps.length;

	// Trigger refs for imperative focusStep
	const triggerRefs = useRef< Map< string, HTMLElement > >( new Map() );

	const registerTriggerRef = useCallback( ( triggerValue: string, el: HTMLElement | null ) => {
		if ( el ) {
			triggerRefs.current.set( triggerValue, el );
		} else {
			triggerRefs.current.delete( triggerValue );
		}
	}, [] );

	useImperativeHandle( ref, () => ( {
		focusStep( targetValue: string ) {
			triggerRefs.current.get( targetValue )?.focus();
		},
	} ) );

	// Dev warnings: missing accessibility label, duplicate values, missing step
	useEffect( () => {
		if ( process.env.NODE_ENV === 'production' ) {
			return;
		}
		if ( ! ariaLabel && ! ariaLabelledBy ) {
			// eslint-disable-next-line no-console
			console.warn(
				"[Stepper] Stepper requires either 'aria-label' or 'aria-labelledby' for accessibility."
			);
		}
	}, [ ariaLabel, ariaLabelledBy ] );

	useEffect( () => {
		if ( process.env.NODE_ENV === 'production' ) {
			return;
		}
		const seen = new Set< string >();
		for ( const s of steps ) {
			if ( seen.has( s.value ) ) {
				// eslint-disable-next-line no-console
				console.warn(
					`[Stepper] Two steps share value '${ s.value }'. Each step must have a unique value.`
				);
			}
			seen.add( s.value );
		}
		if ( value && steps.length > 0 && ! steps.some( ( s ) => s.value === value ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				`[Stepper] No step found with value '${ value }'. Falling back to the first step.`
			);
		}
	}, [ steps, value ] );

	const ctx = useMemo< StepperContextValue >(
		() => ( {
			value,
			onValueChange: handleValueChange,
			orientation,
			linear,
			headingLevel,
			activationMode,
			steps,
			totalSteps,
			registerStep,
			updateStep,
			registerTriggerRef,
			formatStepLabel,
			indicatorVariant,
		} ),
		[
			value,
			handleValueChange,
			orientation,
			linear,
			headingLevel,
			activationMode,
			steps,
			totalSteps,
			registerStep,
			updateStep,
			registerTriggerRef,
			formatStepLabel,
			indicatorVariant,
		]
	);

	return (
		<StepperContext.Provider value={ ctx }>
			{ orientation === 'vertical' ? (
				// Bridge: Accordion.Root value is string[] (single-select via multiple=false).
				// multiple={false} is passed explicitly to guard against base-ui default changing.
				<Accordion.Root
					multiple={ false }
					value={ value ? [ value ] : [] }
					onValueChange={ ( values ) => {
						const next = values[ 0 ];
						if ( next !== undefined ) {
							handleValueChange( next );
						}
					} }
					className={ clsx( className ) }
					style={ style }
					aria-label={ ariaLabel }
					aria-labelledby={ ariaLabelledBy }
					data-indicator-variant={ indicatorVariant }
				>
					{ children }
				</Accordion.Root>
			) : (
				<Tabs.Root
					value={ value !== '' ? value : null }
					onValueChange={ ( next ) => {
						if ( next !== null ) {
							handleValueChange( String( next ) );
						}
					} }
					className={ clsx( className ) }
					style={ style }
					aria-label={ ariaLabel }
					aria-labelledby={ ariaLabelledBy }
					data-indicator-variant={ indicatorVariant }
				>
					{ children }
				</Tabs.Root>
			) }
		</StepperContext.Provider>
	);
} );
