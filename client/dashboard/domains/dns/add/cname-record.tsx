import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const CNAMERecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (host)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain (required)',
		},
		{
			id: 'data',
			label: __( 'Alias of (points to)' ),
			Edit: 'text',
			placeholder: 'e.g. example.com',
		},
		{
			id: 'ttl',
			label: __( 'TTL (time to live)' ),
			Edit: 'text',
			placeholder: 'e.g. 3600',
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'CNAME',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
