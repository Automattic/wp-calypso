import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const ARecordConfig: DnsRecordConfig = {
	description: __(
		'An A record is used to point a domain (e.g. example.com) or a subdomain (e.g. subdomain.example.com) to an IP address (192.168.1.1).'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS A record `name` property */
			placeholder: __( 'Enter subdomain' ),
		},
		{
			// TODO: Add validation for IPv4 address
			id: 'data',
			type: 'text',
			label: __( 'Points to' ),
			/* translators: This is a placeholder for a DNS A record `data` property */
			placeholder: __( 'e.g. 123.45.67.89' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS A record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => ( {
		type: 'A',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
