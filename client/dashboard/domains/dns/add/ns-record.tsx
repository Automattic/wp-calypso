import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const NSRecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'data',
			label: __( 'Host' ),
			Edit: 'text',
			placeholder: 'e.g. ns1.your-provider.com',
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
		type: 'NS',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
