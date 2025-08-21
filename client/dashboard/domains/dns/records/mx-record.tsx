import { __ } from '@wordpress/i18n';
import {
	domainValidator,
	hostnameValidator,
	numberRangeValidator,
	ttlValidator,
} from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const MXRecordConfig: DnsRecordConfig = {
	description: __(
		'MX (mail exchange) records are used to route emails to the correct mail servers.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			/* translators: This is a placeholder for a DNS MX record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Handled by' ),
			/* translators: This is a placeholder for a DNS MX record `data` property */
			placeholder: __( 'e.g. mail.your-provider.com' ),
			isValid: {
				required: true,
				custom: domainValidator( __( 'Please enter a valid mail server.' ) ),
			},
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			/* translators: This is a placeholder for a DNS MX record `aux` property */
			placeholder: __( 'e.g. 10' ),
			isValid: {
				required: true,
				custom: numberRangeValidator( 0, 65535, __( 'Please enter a valid priority value.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS MX record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
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
