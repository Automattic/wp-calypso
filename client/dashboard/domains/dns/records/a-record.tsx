import { __ } from '@wordpress/i18n';
import { getNormalizedName } from '../utils';
import { hostnameValidator, ipv4Validator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

export const ARecordConfig: DnsRecordConfig = {
	description: __(
		'An A record is used to point a domain (e.g. example.com) or a subdomain (e.g. subdomain.example.com) to an IP address (192.168.1.1).'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			/* translators: This is a placeholder for a DNS A record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Points to' ),
			/* translators: This is a placeholder for a DNS A record `data` property */
			placeholder: __( 'e.g. 123.45.67.89' ),
			isValid: {
				required: true,
				custom: ipv4Validator(),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS A record `ttl` property */
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
		type: 'A',
		name: getNormalizedName( data.name, type, domainName ),
		data: data.data,
		ttl: data.ttl,
	} ),
};
