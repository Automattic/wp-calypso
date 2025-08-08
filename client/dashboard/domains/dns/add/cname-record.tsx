import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

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
			isValid: {
				required: true,
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			placeholder: 'e.g. example.com',
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
			type: 'CNAME',
			name: data.name,
			data: hostName + '.', // we need a FQDN here
			ttl: data.ttl,
		};
	},
};
