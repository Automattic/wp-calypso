import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getNormalizedName } from '../utils';
import { hostnameValidator, stringLengthValidator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

export const TXTRecordConfig: DnsRecordConfig = {
	description: __(
		'TXT (text) records are used to record any textual information on a domain. They’re typically used by other service providers (e.g. email services) to ensure you are the owner of the domain.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			/* translators: This is a placeholder for a DNS TXT record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			label: __( 'Text' ),
			/* translators: This is a placeholder for a DNS TXT record `data` property */
			placeholder: __( 'e.g. "v=spf1 include:example.com ~all"' ),
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
			isValid: {
				required: true,
				custom: stringLengthValidator(),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS TXT record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData, domainName: string, type: DnsRecordType ) => ( {
		type: 'TXT',
		name: getNormalizedName( data.name, type, domainName ),
		data: data.data,
		ttl: data.ttl,
	} ),
};
