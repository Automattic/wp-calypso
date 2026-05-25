// packages/ui/src/stepper/trigger.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import { createElement, forwardRef, useCallback } from '@wordpress/element';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import type { ComponentProps, MutableRefObject, ReactNode } from 'react';

type StepperTriggerProps = ComponentProps< 'button' > & {
	children: ReactNode;
	className?: string;
};

export const StepperTrigger = forwardRef< HTMLElement, StepperTriggerProps >(
	function StepperTrigger( { children, className, ...props }, forwardedRef ) {
		const { orientation, headingLevel, registerTriggerRef } = useStepperContext();
		const { value, isCurrent, isDisabled } = useStepContext();

		// Merge forwardedRef and the trigger registration ref
		const callbackRef = useCallback(
			( el: HTMLElement | null ) => {
				registerTriggerRef( value, el );
				if ( typeof forwardedRef === 'function' ) {
					forwardedRef( el );
				} else if ( forwardedRef ) {
					( forwardedRef as MutableRefObject< HTMLElement | null > ).current = el;
				}
			},
			[ value, registerTriggerRef, forwardedRef ]
		);

		if ( orientation === 'vertical' ) {
			return (
				<Accordion.Header
					render={ createElement( `h${ headingLevel }` ) }
					className={ clsx( styles[ 'trigger-heading' ], className ) }
				>
					<Accordion.Trigger
						ref={ callbackRef as React.Ref< HTMLButtonElement > }
						aria-current={ isCurrent ? 'step' : undefined }
						className={ clsx( styles[ 'trigger' ] ) }
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
				ref={ callbackRef as React.Ref< HTMLButtonElement > }
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
