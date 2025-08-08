import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const AliasRecordConfig: DNSRecordConfig = {
	description: __(
		'An ALIAS record is a non-standard DNS record that is used to direct your domain to the target domain. The IP address of the target is resolved on the DNS server.'
	),
	fields: [
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			placeholder: 'e.g. example.com',
			isValid: {
				required: true,
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			placeholder: 'e.g. 3600',
			isValid: {
				required: true,
			},
		},
	],
	form: {
		type: 'regular',
		fields: [ 'data', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const hostName = data.data.endsWith( '.' ) ? data.data.slice( 0, -1 ) : data.data;

		return {
			type: 'ALIAS',
			data: hostName + '.', // we need a FQDN here
			ttl: data.ttl,
		};
	},
};
