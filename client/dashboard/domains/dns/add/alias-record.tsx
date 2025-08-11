import { __ } from '@wordpress/i18n';
import type { DNSRecordFormData, DNSRecordConfig } from './dns-record-configs';

export const AliasRecordConfig: DNSRecordConfig = {
	description: __(
		'An ALIAS record is a non-standard DNS record that is used to direct your domain to the target domain. The IP address of the target is resolved on the DNS server.'
	),
	fields: [
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			/* translators: This is a placeholder for a DNS ALIAS record `data` property */
			placeholder: __( 'e.g. example.com' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS ALIAS record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		type: 'regular',
		fields: [ 'data', 'ttl' ],
	},
	transformData: ( data: DNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'ALIAS',
			data: hostName + '.', // we're appending a dot to make the host name a FQDN
			ttl: data.ttl,
		};
	},
};
