import { basicCatalog, createComponentImplementation } from '@a2ui/react/v0_9';
import {
	ButtonApi,
	Catalog,
	ColumnApi,
	DataBindingSchema,
	markChildRef,
	TextApi,
	TextFieldApi,
} from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton, TextControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );
const actionContextValue = z.union( [
	z.string(),
	z.number(),
	z.boolean(),
	z.array( z.unknown() ),
	DataBindingSchema,
] );
const textFieldApi = {
	name: TextFieldApi.name,
	schema: TextFieldApi.schema.pick( { label: true, value: true, variant: true } ).extend( {
		label: dynamicString,
		value: dynamicString.optional(),
		variant: z.enum( [ 'shortText', 'longText' ] ).optional(),
	} ),
};
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

const TextField = createComponentImplementation( textFieldApi, ( { props, context } ) => {
	const [ localValue, setLocalValue ] = useState( props.value ?? '' );
	const previousValue = useRef( context.componentModel.properties.value );
	useEffect( () => {
		const subscription = context.componentModel.onUpdated.subscribe( () => {
			const nextValue = context.componentModel.properties.value;
			if (
				nextValue !== previousValue.current &&
				( typeof nextValue === 'string' || nextValue === undefined )
			) {
				setLocalValue( nextValue ?? '' );
			}
			previousValue.current = nextValue;
		} );
		return () => subscription.unsubscribe();
	}, [ context.componentModel ] );
	const rawValue = context.componentModel.properties.value;
	const isBound = typeof rawValue === 'object' && rawValue !== null && 'path' in rawValue;
	const value = isBound ? ( props.value ?? '' ) : localValue;
	const onChange = ( nextValue: string ) => {
		setLocalValue( nextValue );
		props.setValue( nextValue );
	};
	const inputProps = {
		label: props.label,
		value,
		onChange,
	};

	return props.variant === 'longText' ? (
		<TextareaControl { ...inputProps } />
	) : (
		<TextControl { ...inputProps } />
	);
} );

const Button = createComponentImplementation( buttonApi, ( { props, buildChild } ) => (
	<GutenbergButton
		variant={ props.variant === 'primary' ? 'primary' : 'secondary' }
		onClick={ props.action }
	>
		{ buildChild( props.child ) }
	</GutenbergButton>
) );

const Text = {
	...basicCatalog.components.get( 'Text' )!,
	schema: TextApi.schema.pick( { text: true } ).extend( { text: dynamicString } ),
};
const Column = {
	...basicCatalog.components.get( 'Column' )!,
	schema: ColumnApi.schema.pick( { children: true } ).extend( {
		children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
	} ),
};
export const catalog = new Catalog(
	basicCatalog.id,
	'0.9',
	[ Text, TextField, Button, Column ],
	[],
	basicCatalog.themeSchema
);
