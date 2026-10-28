import { createComponentImplementation } from '@a2ui/react';
import { DataBindingSchema } from '@a2ui/web_core/v1_0';
import { useEffect, useRef, useState } from '@wordpress/element';
import { InputControl, TextareaControl } from '@wordpress/ui';
import { z } from 'zod';
import { useFieldProps } from '../hooks/use-field-props';
import { ChecksSchema, StringValueSchema } from '../utils/schemas';

export const TextField = createComponentImplementation(
	{
		name: 'TextField',
		schema: z.object( {
			label: StringValueSchema,
			value: StringValueSchema.optional(),
			variant: z.enum( [ 'shortText', 'longText', 'number', 'obscured' ] ).optional(),
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ localValue, setLocalValue ] = useState( props.value ?? '' );
		const previousValue = useRef( context.componentModel.properties.value );
		const { fieldProps, touch } = useFieldProps( props.validationErrors );

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
		const isBound = DataBindingSchema.safeParse( rawValue ).success;
		const value = isBound ? ( props.value ?? '' ) : localValue;
		const onChange = ( nextValue: string ) => {
			setLocalValue( nextValue );
			props.setValue( nextValue );
		};

		const inputProps = {
			...fieldProps,
			label: props.label,
			value,
			onValueChange: onChange,
			onBlur: touch,
		};

		let type: 'number' | 'text' | 'password' = props.variant === 'number' ? 'number' : 'text';

		if ( props.variant === 'obscured' ) {
			type = 'password';
		}

		return props.variant === 'longText' ? (
			<TextareaControl { ...inputProps } />
		) : (
			<InputControl { ...inputProps } type={ type } />
		);
	}
);
