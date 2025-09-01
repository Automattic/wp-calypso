import { __ } from '@wordpress/i18n';
import { getFieldWithDot, getNormalizedName } from '../utils';
import { domainValidator, hostnameValidator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

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
			isValid: {
				required: true,
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Alias of (points to)' ),
			/* translators: This is a placeholder for a DNS CNAME record `data` property */
			placeholder: __( 'e.g. example.com' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `data` field of a DNS CNAME record is invalid */
				custom: domainValidator( __( 'Please enter a valid target host.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS CNAME record `ttl` property */
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
		type: 'CNAME',
		name: getNormalizedName( data.name, type, domainName ),
		data: getFieldWithDot( data.data ),
		ttl: data.ttl,
	} ),
};
