import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const MXRecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'data',
			label: __( 'Handled by' ),
			Edit: 'text',
			placeholder: 'e.g. mail.your-provider.com',
		},
		{
			id: 'aux',
			label: __( 'Priority' ),
			Edit: 'text',
			placeholder: 'e.g. 10',
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
		fields: [ 'name', 'data', 'aux', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'MX',
		name: data.name,
		data: data.data,
		aux: data.aux,
		ttl: data.ttl,
	} ),
};
