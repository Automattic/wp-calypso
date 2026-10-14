import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DateTimeInputApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import useInputValue from './use-input-value';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );

export default createComponentImplementation(
	{
		name: DateTimeInputApi.name,
		schema: DateTimeInputApi.schema
			.pick( {
				label: true,
				value: true,
				enableDate: true,
				enableTime: true,
				min: true,
				max: true,
			} )
			.extend( {
				label: dynamicString.optional(),
				value: dynamicString,
				min: dynamicString.optional(),
				max: dynamicString.optional(),
			} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? '', props.setValue, context );
		if ( ! props.enableDate && ! props.enableTime ) {
			return null;
		}
		let type: 'date' | 'time' | 'datetime-local' = props.enableDate ? 'date' : 'time';
		if ( props.enableDate && props.enableTime ) {
			type = 'datetime-local';
		}
		const normalize = ( date?: string ) => {
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
				type={ type }
				label={ props.label ?? __( 'Date and time', __i18n_text_domain__ ) }
				value={ normalize( value ) }
				min={ normalize( props.min ) || undefined }
				max={ normalize( props.max ) || undefined }
				onChange={ onChange }
			/>
		);
	}
);
