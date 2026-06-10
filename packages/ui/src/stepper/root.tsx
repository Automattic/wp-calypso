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
import { warning } from '../utils/warning';
import { StepperContext, defaultFormatStepLabel } from './context';
import styles from './style.module.scss';
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
	const value = valueProp ?? internalValue;

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
		if ( ! ariaLabel && ! ariaLabelledBy ) {
			warning(
				"[Stepper] Stepper requires either 'aria-label' or 'aria-labelledby' for accessibility."
			);
		}
		const seenValues = new Set< string >();
		for ( const s of steps ) {
			if ( seenValues.has( s.value ) ) {
				warning(
					`[Stepper] Two steps share value '${ s.value }'. Each step must have a unique value.`
				);
			}
			seenValues.add( s.value );
		}
		if ( value && steps.length > 0 && ! steps.some( ( s ) => s.value === value ) ) {
			warning(
				`[Stepper] No step found with value '${ value }'. Check that the value matches one of the registered step values.`
			);
		}
	}, [ ariaLabel, ariaLabelledBy, steps, value ] );

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
					className={ clsx( styles.root, className ) }
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
					className={ clsx( styles.root, className ) }
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
