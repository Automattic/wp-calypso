import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const NSRecordConfig: DnsRecordConfig = {
	description: __(
		'NS (name server) records are used to delegate the authoritative DNS servers for a subdomain.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS NS record `name` property */
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Host' ),
			/* translators: This is a placeholder for a DNS NS record `data` property */
			placeholder: __( 'e.g. ns1.your-provider.com' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS NS record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'NS',
			name: data.name,
			data: hostName + '.', // we're appending a dot to make the host name a FQDN
			ttl: data.ttl,
		};
	},
};
