import { createComponentImplementation } from '@a2ui/react';
import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import { useFieldProps } from '../hooks/use-field-props';
import { useInputValue } from '../hooks/use-input-value';
import { ChecksSchema, StringValueSchema } from '../utils/schemas';
import type { FocusEvent } from 'react';

export const DateTimeInput = createComponentImplementation(
	{
		name: 'DateTimeInput',
		schema: z.object( {
			label: StringValueSchema.optional(),
			value: StringValueSchema,
			enableDate: z.boolean().optional(),
			enableTime: z.boolean().optional(),
			min: StringValueSchema.optional(),
			max: StringValueSchema.optional(),
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? '', props.setValue, context );
		const [ validationMessage, setValidationMessage ] = useState( '' );
		const { fieldProps, touch } = useFieldProps(
			validationMessage
				? [ validationMessage, ...( props.validationErrors ?? [] ) ]
				: props.validationErrors
		);

		if ( ! props.enableDate && ! props.enableTime ) {
			return null;
		}

		let type: 'date' | 'time' | 'datetime-local' = props.enableDate ? 'date' : 'time';

		if ( props.enableDate && props.enableTime ) {
			type = 'datetime-local';
		}

		const toInputValue = ( date?: string ) => {
			if ( ! date ) {
				return '';
			}

			if ( type === 'date' ) {
				return date.slice( 0, 10 );
			}

			if ( type === 'time' ) {
				return ( date.split( 'T' )[ 1 ] ?? date ).slice( 0, 5 );
			}

			return date.slice( 0, 16 );
		};

		return (
			<TextControl
				{ ...fieldProps }
				type={ type }
				label={ props.label ?? __( 'Date and time', 'default' ) }
				value={ toInputValue( value ) }
				min={ toInputValue( props.min ) || undefined }
				max={ toInputValue( props.max ) || undefined }
				onBlur={ ( event: FocusEvent< HTMLInputElement > ) => {
					setValidationMessage( event.currentTarget.validationMessage );
					touch();
				} }
				onChange={ onChange }
			/>
		);
	}
);
