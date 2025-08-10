import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './types';

export const TXTRecordConfig: DNSRecordConfig = {
	description: __(
		"TXT (text) records are used to record any textual information on a domain. They're typically used by other service providers (e.g. email services) to ensure you are the owner of the domain."
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'data',
			label: __( 'Text' ),
			placeholder: 'e.g. "v=spf1 include:example.com ~all"',
			Edit: ( { data, field, onChange, hideLabelFromVision } ) => {
				const { id, getValue } = field;

				return (
					<TextareaControl
						__nextHasNoMarginBottom
						value={ getValue( { item: data } ) || '' }
						onChange={ ( value ) => onChange( { [ id ]: value } ) }
						placeholder={ field.placeholder }
						label={ hideLabelFromVision ? undefined : field.label }
						rows={ 4 }
					/>
				);
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			placeholder: 'e.g. 3600',
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DNSRecordFormData ) => ( {
		type: 'TXT',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
