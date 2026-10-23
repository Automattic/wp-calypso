import { createComponentImplementation } from '@a2ui/react';
import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import { useInputValue } from '../hooks/use-input-value';
import { StringValueSchema } from '../utils/schemas';
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
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? '', props.setValue, context );
		const [ errorMessage, setErrorMessage ] = useState( '' );

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
				className={ errorMessage ? 'ai-ui-renderer__date-time-input--error' : undefined }
				type={ type }
				label={ props.label ?? __( 'Date and time', 'default' ) }
				value={ toInputValue( value ) }
				min={ toInputValue( props.min ) || undefined }
				max={ toInputValue( props.max ) || undefined }
				help={ errorMessage }
				aria-invalid={ !! errorMessage }
				onBlur={ ( event: FocusEvent< HTMLInputElement > ) =>
					setErrorMessage( event.currentTarget.validationMessage )
				}
				onChange={ onChange }
			/>
		);
	}
);
