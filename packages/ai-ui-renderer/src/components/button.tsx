import { createComponentImplementation, MarkdownContext } from '@a2ui/react';
import { ActionSchema, ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Button as GutenbergButton } from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { z } from 'zod';
import { ModalTriggerContext } from '../contexts/surface';

export const Button = createComponentImplementation(
	{
		name: 'Button',
		schema: z.object( {
			child: ComponentIdSchema,
			action: ActionSchema,
			variant: z.enum( [ 'default', 'primary' ] ).optional(),
		} ),
	},
	( { props, buildChild } ) => {
		const openModal = useContext( ModalTriggerContext );

		return (
			<GutenbergButton
				variant={ props.variant === 'primary' ? 'primary' : 'secondary' }
				onClick={ openModal ?? ( () => props.action() ) }
			>
				<MarkdownContext.Provider value={ undefined }>
					{ buildChild( props.child ) }
				</MarkdownContext.Provider>
			</GutenbergButton>
		);
	}
);
