import { createComponentImplementation, MarkdownContext } from '@a2ui/react';
import { ActionSchema, ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { flushSync, useId } from '@wordpress/element';
import { Button as WordPressButton, VisuallyHidden } from '@wordpress/ui';
import { z } from 'zod';
import { useInteractiveUiSurface, useModalTrigger } from '../contexts/surface';
import { ChecksSchema } from '../utils/schemas';
import type { SyntheticEvent } from 'react';

const VARIANTS = { default: 'outline', primary: 'solid', borderless: 'minimal' } as const;

export const Button = createComponentImplementation(
	{
		name: 'Button',
		schema: z.object( {
			child: ComponentIdSchema,
			action: ActionSchema,
			variant: z.enum( [ 'default', 'primary', 'borderless' ] ).optional(),
			checks: ChecksSchema,
		} ),
	},
	( { props, buildChild } ) => {
		const descriptionId = useId();
		const openModal = useModalTrigger();
		const { disabled, showErrors } = useInteractiveUiSurface();
		const isInvalid = props.isValid === false;
		// Opening a modal changes nothing, so its trigger stays usable on a disabled surface.
		const isDisabled = isInvalid || ( disabled && ! openModal );

		// Shows the surface's errors and moves to the first one, skipping fields on hidden tabs.
		const showFirstError = ( event: SyntheticEvent< HTMLElement > ) => {
			const container = event.currentTarget.closest( '.ai-ui-renderer' );

			flushSync( () => showErrors?.() );

			Array.from( container?.querySelectorAll< HTMLElement >( '[aria-invalid="true"]' ) ?? [] )
				.find( ( field ) => ! field.closest( '[hidden]' ) )
				?.focus();
		};

		return (
			<>
				<WordPressButton
					className="ai-ui-renderer__button"
					variant={ VARIANTS[ props.variant ?? 'default' ] }
					disabled={ isDisabled }
					focusableWhenDisabled
					// Disabled buttons suppress activation, so validation runs during capture.
					onClickCapture={ isInvalid && ! disabled ? showFirstError : undefined }
					onKeyDownCapture={
						isInvalid && ! disabled
							? ( event ) => {
									if ( event.key === 'Enter' || event.key === ' ' ) {
										event.preventDefault();
										showFirstError( event );
									}
								}
							: undefined
					}
					aria-describedby={ isInvalid ? descriptionId : undefined }
					onClick={ ( event ) => ( openModal ? openModal( event.currentTarget ) : props.action() ) }
				>
					<MarkdownContext.Provider value={ undefined }>
						{ buildChild( props.child ) }
					</MarkdownContext.Provider>
				</WordPressButton>
				{ isInvalid && (
					<VisuallyHidden id={ descriptionId }>
						{ props.validationErrors?.join( ' ' ) }
					</VisuallyHidden>
				) }
			</>
		);
	}
);
