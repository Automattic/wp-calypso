import { createComponentImplementation, MarkdownContext } from '@a2ui/react/v0_9';
import { ButtonApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton } from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { z } from 'zod';
import { ModalTriggerContext } from './context';

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
} );

export default Button;
