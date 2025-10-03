import { __ } from '@wordpress/i18n';
import { getFieldWithDot, getNormalizedName } from '../utils';
import { domainValidator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

export const AliasRecordConfig: DnsRecordConfig = {
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
			isValid: {
				required: true,
				/* translators: This is the error message when the `data` field of a DNS ALIAS record is invalid */
				custom: domainValidator( __( 'Please enter a valid target host.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS ALIAS record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData, domainName: string, type: DnsRecordType ) => ( {
		type: 'ALIAS',
		name: getNormalizedName( data.name, type, domainName ),
		data: getFieldWithDot( data.data ),
		ttl: data.ttl,
	} ),
};
