import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './dns-record-configs';

export const MXRecordConfig: DNSRecordConfig = {
	description: __(
		'MX (mail exchange) records are used to route emails to the correct mail servers.'
	),
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
			label: __( 'Handled by' ),
			placeholder: 'e.g. mail.your-provider.com',
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			placeholder: 'e.g. 10',
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
		fields: [ 'name', 'data', 'aux', 'ttl' ],
	},
	transformData: ( data: DNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'MX',
			name: data.name,
			data: hostName + '.', // we're appending a dot to make the host name a FQDN
			aux: data.aux,
			ttl: data.ttl,
		};
	},
};
