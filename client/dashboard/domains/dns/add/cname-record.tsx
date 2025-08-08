import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const CNAMERecordConfig: DNSRecordConfig = {
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
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'CNAME',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
