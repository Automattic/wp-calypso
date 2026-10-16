import { createComponentImplementation, MarkdownContext } from '@a2ui/react/v0_9';
import { ButtonApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton } from '@wordpress/components';
import { useContext, useState } from '@wordpress/element';
import { z } from 'zod';
import { ModalTriggerContext } from './context';
import type { MouseEvent } from 'react';

const actionContextValue = z.union( [
	z.string(),
	z.number(),
	z.boolean(),
	z.array( z.unknown() ),
	DataBindingSchema,
] );
const buttonApi = {
	name: ButtonApi.name,
	schema: ButtonApi.schema.pick( { child: true, action: true, variant: true } ).extend( {
		variant: z.enum( [ 'default', 'primary' ] ).optional(),
		action: z
			.object( {
				event: z
					.object( {
						name: z.string(),
						context: z.record( actionContextValue ).optional(),
					} )
					.strict(),
			} )
			.strict()
			.describe( 'REF:#/$defs/Action' ),
	} ),
};

const Button = createComponentImplementation( buttonApi, ( { props, buildChild } ) => {
	const openModal = useContext( ModalTriggerContext );
	const [ validationError, setValidationError ] = useState< {
		label?: string;
		message: string;
	} >();
	return (
		<>
			<GutenbergButton
				variant={ props.variant === 'primary' ? 'primary' : 'secondary' }
				onClick={ ( event: MouseEvent< HTMLButtonElement > ) => {
					if ( openModal ) {
						openModal();
						return;
					}
					const invalidInput = event.currentTarget
						.closest( '.agents-manager-interactive-ui' )
						?.querySelector< HTMLInputElement >(
							'input[type="date"]:invalid, input[type="time"]:invalid, input[type="datetime-local"]:invalid'
						);
					if ( invalidInput ) {
						setValidationError( {
							label: invalidInput.labels?.[ 0 ]?.textContent ?? undefined,
							message: invalidInput.validationMessage,
						} );
						invalidInput.reportValidity();
						return;
					}
					setValidationError( undefined );
					props.action();
				} }
			>
				<MarkdownContext.Provider value={ undefined }>
					{ buildChild( props.child ) }
				</MarkdownContext.Provider>
			</GutenbergButton>
			{ validationError && (
				<p role="alert">
					{ validationError.label && <strong>{ validationError.label } </strong> }
					{ validationError.message }
				</p>
			) }
		</>
	);
} );

export default Button;
