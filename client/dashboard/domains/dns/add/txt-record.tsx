import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const TXTRecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'data',
			label: __( 'Text' ),
			Edit: 'text',
			placeholder: 'e.g. "v=spf1 include:example.com ~all"',
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
		type: 'TXT',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
