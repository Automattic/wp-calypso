import { basicCatalog, createComponentImplementation } from '@a2ui/react/v0_9';
import { ButtonApi, Catalog, TextFieldApi } from '@a2ui/web_core/v0_9';
import { Button as GutenbergButton, TextControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { validateA2uiTextField } from '../utils/a2ui-validation';

declare const __i18n_text_domain__: string;

export const A2UI_CATALOG_ID = basicCatalog.id;

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
	const validation = validateA2uiTextField( value, props.validationRegexp );
	const invalid = props.isValid === false || validation !== 'valid';
	let validationHelp;
	if ( validation === 'invalid-pattern' ) {
		validationHelp = __( 'This field has an invalid validation rule.', __i18n_text_domain__ );
	} else if ( invalid ) {
		validationHelp = __( 'Please enter a valid value.', __i18n_text_domain__ );
	}
	const onChange = ( nextValue: string ) => {
		setLocalValue( nextValue );
		props.setValue( nextValue );
	};
	const inputProps = {
		label: props.label,
		value,
		onChange,
		'aria-invalid': invalid || undefined,
		help: props.validationErrors?.join( ' ' ) || validationHelp,
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
	A2UI_CATALOG_ID,
	'0.9',
	[ ...basicCatalog.components.values() ].map(
		( component ) => overrides.get( component.name ) ?? component
	),
	[ ...basicCatalog.functions.values() ],
	basicCatalog.themeSchema
);
