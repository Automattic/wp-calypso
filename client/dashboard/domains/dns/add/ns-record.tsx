import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './dns-record-configs';

export const NSRecordConfig: DNSRecordConfig = {
	description: __(
		'NS (name server) records are used to delegate the authoritative DNS servers for a subdomain.'
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
			type: 'text',
			label: __( 'Host' ),
			placeholder: 'e.g. ns1.your-provider.com',
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
	transformData: ( data: DNSRecordFormData ) => {
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
