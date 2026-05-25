import { TabProvider } from '@ariakit/react/tab';
import {
	forwardRef,
	useCallback,
	useId,
	useImperativeHandle,
	useRef,
	useState,
} from '@wordpress/element';
import clsx from 'clsx';
import { StepperContext, defaultFormatStepLabel, useStepRegistry } from './context';
import styles from './style.module.scss';
import { stepTriggerId } from './types';
import type { StepperRef, StepperRootProps } from './types';

export const StepperRoot = forwardRef< StepperRef, StepperRootProps >( function StepperRoot(
	{
		orientation,
		value: controlledValue,
		defaultValue,
		onValueChange,
		linear = false,
		headingLevel = 3,
		activationMode = 'manual',
		formatStepLabel = defaultFormatStepLabel,
		children,
		className,
		...ariaProps
	},
	ref
) {
	const rootId = useId();
	const isControlled = controlledValue !== undefined;
	const [ uncontrolledValue, setUncontrolledValue ] = useState< string >( defaultValue ?? '' );

	const activeValue = isControlled ? ( controlledValue as string ) : uncontrolledValue;

	const triggerElementsRef = useRef< Map< string, HTMLElement > >( new Map() );

	const handleValueChange = useCallback(
		( newValue: string ) => {
			if ( ! isControlled ) {
				setUncontrolledValue( newValue );
			}
			onValueChange?.( newValue );
		},
		[ isControlled, onValueChange ]
	);

	const { steps, registerStep } = useStepRegistry();

	useImperativeHandle( ref, () => ( {
		focusStep( value: string ) {
			triggerElementsRef.current.get( value )?.focus();
		},
	} ) );

	const contextValue = {
		rootId,
		value: activeValue,
		onValueChange: handleValueChange,
		orientation,
		linear,
		headingLevel,
		activationMode,
		formatStepLabel,
		steps,
		registerStep,
	};

	const rootEl = (
		<div
			className={ clsx( styles.root, styles[ `is-${ orientation }` ], className ) }
			data-orientation={ orientation }
			{ ...ariaProps }
		>
			{ children }
		</div>
	);

	// Ariakit Tab uses the Tab component's `id` as the selectedId, which we
	// set to stepTriggerId(rootId, value). Map back and forth here.
	const activeTriggerId = activeValue ? stepTriggerId( rootId, activeValue ) : null;
	const triggerPrefix = `stepper-${ rootId }-trigger-`;

	return (
		<StepperContext.Provider value={ contextValue }>
			{ orientation === 'horizontal' ? (
				<TabProvider
					selectedId={ activeTriggerId }
					setSelectedId={ ( id: string | null | undefined ) => {
						if ( ! id ) {
							return;
						}
						const stepValue = id.startsWith( triggerPrefix )
							? id.slice( triggerPrefix.length )
							: id;
						handleValueChange( stepValue );
					} }
					selectOnMove={ activationMode === 'auto' }
				>
					{ rootEl }
				</TabProvider>
			) : (
				rootEl
			) }
		</StepperContext.Provider>
	);
} );

StepperRoot.displayName = 'Stepper.Root';
