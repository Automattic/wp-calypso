import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const AAAARecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'data',
			label: __( 'Points to' ),
			Edit: 'text',
			placeholder: 'e.g. 2001:500:84::b',
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
		type: 'AAAA',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
