import { createComponentImplementation, MarkdownContext } from '@a2ui/react';
import { ActionSchema, ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Button as GutenbergButton } from '@wordpress/components';
import { flushSync } from '@wordpress/element';
import { z } from 'zod';
import { useInteractiveUiSurface, useModalTrigger } from '../contexts/surface';
import { ChecksSchema } from '../utils/schemas';
import type { MouseEvent } from 'react';

const VARIANTS = { default: 'secondary', primary: 'primary', borderless: 'tertiary' } as const;

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
		const openModal = useModalTrigger();
		const { disabled, showErrors } = useInteractiveUiSurface();
		const isInvalid = props.isValid === false;
		// Opening a modal changes nothing, so its trigger stays usable on a disabled surface.
		const isDisabled = isInvalid || ( disabled && ! openModal );

		// Shows the surface's errors and moves to the first one, skipping fields on hidden tabs.
		const showFirstError = ( event: MouseEvent< HTMLElement > ) => {
			const container = event.currentTarget.closest( '.ai-ui-renderer' );

			flushSync( () => showErrors?.() );

			Array.from( container?.querySelectorAll< HTMLElement >( '[aria-invalid="true"]' ) ?? [] )
				.find( ( field ) => ! field.closest( '[hidden]' ) )
				?.focus();
		};

		return (
			<GutenbergButton
				className="ai-ui-renderer__button"
				variant={ VARIANTS[ props.variant ?? 'default' ] }
				disabled={ isDisabled }
				accessibleWhenDisabled
				// WordPress swallows the click on a disabled Button in the bubble phase, and its
				// `onMouseDown` `preventDefault` keeps the focused field from blurring.
				onClickCapture={ isInvalid && ! disabled ? showFirstError : undefined }
				description={ isInvalid ? props.validationErrors?.join( ' ' ) : undefined }
				onClick={ openModal ?? ( () => props.action() ) }
			>
				<MarkdownContext.Provider value={ undefined }>
					{ buildChild( props.child ) }
				</MarkdownContext.Provider>
			</GutenbergButton>
		);
	}
);
