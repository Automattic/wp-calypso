import { __ } from '@wordpress/i18n';
import { getNormalizedName } from '../utils';
import { hostnameValidator, ipv6Validator, ttlValidator } from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

export const AAAARecordConfig: DnsRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			/* translators: This is a placeholder for a DNS AAAA record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Points to' ),
			/* translators: This is a placeholder for a DNS AAAA record `data` property */
			placeholder: __( 'e.g. 2001:500:84::b' ),
			isValid: {
				required: true,
				custom: ipv6Validator(),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS AAAA record `ttl` property */
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
		type: 'AAAA',
		name: getNormalizedName( data.name, type, domainName ),
		data: data.data,
		ttl: data.ttl,
	} ),
};
