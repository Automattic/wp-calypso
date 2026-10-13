import { createComponentImplementation, MarkdownContext } from '@a2ui/react/v0_9';
import { ButtonApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
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

const Button = createComponentImplementation( buttonApi, ( { props, context, buildChild } ) => {
	const [ isBusy, setIsBusy ] = useState( false );
	useEffect( () => {
		setIsBusy( false );
		const subscription = context.componentModel.onUpdated.subscribe( () => setIsBusy( false ) );
		return () => subscription.unsubscribe();
	}, [ context.componentModel ] );
	useEffect( () => {
		if ( ! isBusy ) {
			return;
		}
		const timeout = setTimeout( () => setIsBusy( false ), 10000 );
		return () => clearTimeout( timeout );
	}, [ isBusy ] );

	return (
		<GutenbergButton
			variant={ props.variant === 'primary' ? 'primary' : 'secondary' }
			isBusy={ isBusy }
			onClick={ () => {
				setIsBusy( true );
				props.action();
			} }
		>
			<MarkdownContext.Provider value={ undefined }>
				{ buildChild( props.child ) }
			</MarkdownContext.Provider>
		</GutenbergButton>
	);
} );

export default Button;
