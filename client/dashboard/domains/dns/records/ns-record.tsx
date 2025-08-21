import { __ } from '@wordpress/i18n';
import { getFieldWithDot, getNormalizedName } from '../utils';
import { domainValidator, hostnameValidator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

export const NSRecordConfig: DnsRecordConfig = {
	description: __(
		'NS (name server) records are used to delegate the authoritative DNS servers for a subdomain.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			/* translators: This is a placeholder for a DNS NS record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				required: true,
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Host' ),
			/* translators: This is a placeholder for a DNS NS record `data` property */
			placeholder: __( 'e.g. ns1.your-provider.com' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `data` field of a DNS NS record is invalid */
				custom: domainValidator( __( 'Please enter a valid host.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS NS record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData, domainName: string, type: DnsRecordType ) => ( {
		type: 'NS',
		name: getNormalizedName( data.name, type, domainName ),
		data: getFieldWithDot( data.data ),
		ttl: data.ttl,
	} ),
};
