import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const MXRecordConfig: DnsRecordConfig = {
	description: __(
		'MX (mail exchange) records are used to route emails to the correct mail servers.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS MX record `name` property */
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Handled by' ),
			/* translators: This is a placeholder for a DNS MX record `data` property */
			placeholder: __( 'e.g. mail.your-provider.com' ),
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			/* translators: This is a placeholder for a DNS MX record `aux` property */
			placeholder: __( 'e.g. 10' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS MX record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'aux', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => {
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
