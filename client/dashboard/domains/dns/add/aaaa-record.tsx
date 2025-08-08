import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const AAAARecordConfig: DNSRecordConfig = {
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
			label: __( 'Points to' ),
			placeholder: 'e.g. 2001:500:84::b',
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
		type: 'AAAA',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
