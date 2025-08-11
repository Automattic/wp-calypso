import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './dns-record-configs';

export const CNAMERecordConfig: DNSRecordConfig = {
	description: __(
		'CNAME (canonical name) records are typically used to link a subdomain (e.g. subdomain.example.com) to a domain (e.g. example.com).'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (host)' ),
			placeholder: 'Enter subdomain (required)',
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			placeholder: 'e.g. example.com',
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
			type: 'CNAME',
			name: data.name,
			data: hostName + '.', // we're appending a dot to make the host name a FQDN
			ttl: data.ttl,
		};
	},
};
