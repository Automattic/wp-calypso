import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './types';

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
	transformData: ( data: DNSRecordFormData ) => ( {
		type: 'AAAA',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
