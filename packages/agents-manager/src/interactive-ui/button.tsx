import { createComponentImplementation, MarkdownContext } from '@a2ui/react/v0_9';
import { ButtonApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton } from '@wordpress/components';
import { z } from 'zod';

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
	return (
		<GutenbergButton
			variant={ props.variant === 'primary' ? 'primary' : 'secondary' }
			onClick={ () => props.action() }
		>
			<MarkdownContext.Provider value={ undefined }>
				{ buildChild( props.child ) }
			</MarkdownContext.Provider>
		</GutenbergButton>
	);
} );

export default Button;
