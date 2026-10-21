// packages/ui/src/stepper/trigger.tsx
import { Accordion } from '@base-ui/react/accordion';
import { Tabs } from '@base-ui/react/tabs';
import { createElement, forwardRef, useCallback, useMemo, useRef } from '@wordpress/element';
import { Button } from '@wordpress/ui';
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
		// Updated during render (not in an effect) so the value is always
		// current before any commit-phase callback fires.
		const forwardedRefStable = useRef( forwardedRef );
		forwardedRefStable.current = forwardedRef;

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

		// Stable reference so Accordion.Header does not remount on every render
		const headerElement = useMemo( () => createElement( `h${ headingLevel }` ), [ headingLevel ] );

		if ( orientation === 'vertical' ) {
			return (
				<Accordion.Header render={ headerElement } className={ styles[ 'trigger-heading' ] }>
					<Accordion.Trigger
						ref={ callbackRef as Ref< HTMLButtonElement > }
						render={ <Button variant="minimal" /> }
						aria-current={ isCurrent ? 'step' : undefined }
						className={ clsx( styles[ 'trigger' ], className ) }
						{ ...props }
						onClick={ ( e ) => {
							// Prevent accordion from toggling closed when the active step trigger
							// is clicked. Without this, BaseUI fires onValueChange([]) which our
							// bridge ignores — but the accordion may start a collapse animation
							// before the controlled value is re-applied.
							if ( isCurrent ) {
								e.preventDefault();
							}
							props.onClick?.( e );
						} }
					>
						{ children }
					</Accordion.Trigger>
				</Accordion.Header>
			);
		}

		// Horizontal: Tabs.Tab
		// Base UI internally sets focusableWhenDisabled: true, so disabled tabs
		// remain in the tab order and receive aria-disabled rather than disabled.
		return (
			<Tabs.Tab
				ref={ callbackRef as Ref< HTMLButtonElement > }
				value={ value }
				disabled={ isDisabled }
				render={ <Button variant="minimal" /> }
				aria-current={ isCurrent ? 'step' : undefined }
				className={ clsx( styles[ 'trigger' ], className ) }
				{ ...props }
			>
				{ children }
			</Tabs.Tab>
		);
	}
);
