import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, TextFieldApi } from '@a2ui/web_core/v0_9';
import { TextControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );
const textFieldApi = {
	name: TextFieldApi.name,
	schema: TextFieldApi.schema.pick( { label: true, value: true, variant: true } ).extend( {
		label: dynamicString,
		value: dynamicString.optional(),
		variant: z.enum( [ 'shortText', 'longText' ] ).optional(),
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

export default TextField;
