// packages/ui/src/stepper/trigger.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import { createElement, forwardRef, useCallback, useEffect, useRef } from '@wordpress/element';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, MutableRefObject, ReactNode, Ref } from 'react';

type StepperTriggerProps = ComponentProps< 'button' > & {
	children: ReactNode;
	className?: string;
};

export const StepperTrigger = forwardRef< HTMLElement, StepperTriggerProps >(
	function StepperTrigger( { children, className, ...props }, forwardedRef ) {
		const { orientation, headingLevel, registerTriggerRef } = useStepperContext();
		const { value, isCurrent, isDisabled } = useStepContext();

		// Keep a stable ref to forwardedRef so callbackRef doesn't change
		// identity when the parent passes an inline callback ref.
		const forwardedRefStable = useRef( forwardedRef );
		useEffect( () => {
			forwardedRefStable.current = forwardedRef;
		}, [ forwardedRef ] );

		// Merge forwardedRef and the trigger registration ref
		const callbackRef = useCallback(
			( el: HTMLElement | null ) => {
				registerTriggerRef( value, el );
				const ref = forwardedRefStable.current;
				if ( typeof ref === 'function' ) {
					ref( el );
				} else if ( ref ) {
					( ref as MutableRefObject< HTMLElement | null > ).current = el;
				}
			},
			[ value, registerTriggerRef ]
		);

		if ( orientation === 'vertical' ) {
			return (
				<Accordion.Header
					render={ createElement( `h${ headingLevel }` ) }
					className={ styles[ 'trigger-heading' ] }
				>
					<Accordion.Trigger
						ref={ callbackRef as Ref< HTMLButtonElement > }
						aria-current={ isCurrent ? 'step' : undefined }
						className={ clsx( styles[ 'trigger' ], className ) }
						{ ...props }
					>
						{ children }
					</Accordion.Trigger>
				</Accordion.Header>
			);
		}

		// Horizontal: Tabs.Tab
		return (
			<Tabs.Tab
				ref={ callbackRef as Ref< HTMLButtonElement > }
				value={ value }
				disabled={ isDisabled }
				aria-current={ isCurrent ? 'step' : undefined }
				className={ clsx( styles[ 'trigger' ], className ) }
				{ ...props }
			>
				{ children }
			</Tabs.Tab>
		);
	}
);
