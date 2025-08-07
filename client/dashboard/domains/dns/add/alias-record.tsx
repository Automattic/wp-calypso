import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const AliasRecordConfig: DNSRecordConfig = {
	fields: [
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
		fields: [ 'data', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'ALIAS',
		data: data.data,
		ttl: data.ttl,
	} ),
};
