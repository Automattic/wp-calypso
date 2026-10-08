import { basicCatalog, createComponentImplementation } from '@a2ui/react/v0_9';
import { ButtonApi, Catalog, TextFieldApi } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton, TextControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

const TextField = createComponentImplementation( TextFieldApi, ( { props, context } ) => {
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
		'aria-invalid': props.isValid === false || undefined,
	};

	const inputType = (
		{
			longText: 'text',
			number: 'number',
			shortText: 'text',
			obscured: 'password',
		} as const
	 )[ props.variant ?? 'shortText' ];
	return props.variant === 'longText' ? (
		<TextareaControl { ...inputProps } />
	) : (
		<TextControl { ...inputProps } type={ inputType } />
	);
} );

const Button = createComponentImplementation( ButtonApi, ( { props, buildChild } ) => (
	<GutenbergButton
		variant={
			( { primary: 'primary', borderless: 'tertiary', default: 'secondary' } as const )[
				props.variant ?? 'default'
			]
		}
		disabled={ props.isValid === false }
		onClick={ props.action }
	>
		{ buildChild( props.child ) }
	</GutenbergButton>
) );

const overrides = new Map(
	[ TextField, Button ].map( ( component ) => [ component.name, component ] )
);
export const catalog = new Catalog(
	basicCatalog.id,
	'0.9',
	[ ...basicCatalog.components.values() ].map(
		( component ) => overrides.get( component.name ) ?? component
	),
	[ ...basicCatalog.functions.values() ],
	basicCatalog.themeSchema
);
