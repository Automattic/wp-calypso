import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const NSRecordConfig: DNSRecordConfig = {
	description: __(
		'NS (name server) records are used to delegate the authoritative DNS servers for a subdomain.'
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
			label: __( 'Host' ),
			placeholder: 'e.g. ns1.your-provider.com',
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
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'NS',
			name: data.name,
			data: hostName + '.', // we need a FQDN here
			ttl: data.ttl,
		};
	},
};
