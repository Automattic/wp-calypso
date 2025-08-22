import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const AAAARecordConfig: DnsRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS AAAA record `name` property */
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Points to' ),
			/* translators: This is a placeholder for a DNS AAAA record `data` property */
			placeholder: __( 'e.g. 2001:500:84::b' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS AAAA record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => ( {
		type: 'AAAA',
		name: data.name,
		data: data.data,
		ttl: data.ttl,
	} ),
};
