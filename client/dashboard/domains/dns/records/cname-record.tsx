import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const CNAMERecordConfig: DnsRecordConfig = {
	description: __(
		'CNAME (canonical name) records are typically used to link a subdomain (e.g. subdomain.example.com) to a domain (e.g. example.com).'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (host)' ),
			/* translators: This is a placeholder for a DNS CNAME record `name` property */
			placeholder: __( 'Enter subdomain (required)' ),
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			/* translators: This is a placeholder for a DNS CNAME record `data` property */
			placeholder: __( 'e.g. example.com' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS CNAME record `ttl` property */
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
			type: 'CNAME',
			name: data.name,
			data: hostName + '.', // we're appending a dot to make the host name a FQDN
			ttl: data.ttl,
		};
	},
};
