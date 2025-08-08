import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const MXRecordConfig: DNSRecordConfig = {
	description: __(
		'MX (mail exchange) records are used to route emails to the correct mail servers.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: 'Enter subdomain',
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Handled by' ),
			placeholder: 'e.g. mail.your-provider.com',
			isValid: {
				required: true,
			},
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			placeholder: 'e.g. 10',
			isValid: {
				required: true,
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			placeholder: 'e.g. 3600',
			isValid: {
				required: true,
			},
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'data', 'aux', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'MX',
			name: data.name,
			data: hostName + '.', // we need a FQDN here
			aux: data.aux,
			ttl: data.ttl,
		};
	},
};
