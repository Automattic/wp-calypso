import { __ } from '@wordpress/i18n';
import { getFieldWithDot, getNormalizedName } from '../utils';
import {
	domainValidator,
	hostnameValidator,
	numberRangeValidator,
	serviceValidator,
	ttlValidator,
} from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';

export const SRVRecordConfig: DnsRecordConfig = {
	description: __(
		'SRV (service) records define the information to access certain internet services.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name' ),
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'service',
			type: 'text',
			label: __( 'Service' ),
			/* translators: This is a placeholder for a DNS SRV record `service` property */
			placeholder: __( 'e.g. sip' ),
			isValid: {
				required: true,
				custom: serviceValidator(),
			},
		},
		{
			id: 'protocol',
			label: __( 'Protocol' ),
			Edit: 'select',
			elements: [
				{ label: '_tcp', value: '_tcp' },
				{ label: '_udp', value: '_udp' },
				{ label: '_tls', value: '_tls' },
			],
			isValid: {
				required: true,
			},
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			/* translators: This is a placeholder for a DNS SRV record `priority` property */
			placeholder: __( 'e.g. 10' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `aux` field of a DNS SRV record is invalid */
				custom: numberRangeValidator( 0, 65535, __( 'Please enter a valid priority value.' ) ),
			},
		},
		{
			id: 'weight',
			type: 'integer',
			label: __( 'Weight' ),
			/* translators: This is a placeholder for a DNS SRV record `weight` property */
			placeholder: __( 'e.g. 10' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `weight` field of a DNS SRV record is invalid */
				custom: numberRangeValidator( 0, 65535, __( 'Please enter a valid weight value.' ) ),
			},
		},
		{
			id: 'target',
			type: 'text',
			label: __( 'Target host' ),
			/* translators: This is a placeholder for a DNS SRV record `target` property */
			placeholder: __( 'e.g. sip.your-provider.com' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `target` field of a DNS SRV record is invalid */
				custom: domainValidator( __( 'Please enter a valid target host.' ) ),
			},
		},
		{
			id: 'port',
			type: 'integer',
			label: __( 'Target port' ),
			/* translators: This is a placeholder for a DNS SRV record `port` property */
			placeholder: __( 'e.g. 5060' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `port` field of a DNS SRV record is invalid */
				custom: numberRangeValidator( 0, 65535, __( 'Please enter a valid port value.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS SRV record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'service', 'protocol', 'aux', 'weight', 'target', 'port', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData, domainName: string, type: DnsRecordType ) => ( {
		type: 'SRV',
		name: getNormalizedName( data.name, type, domainName ),
		service: data.service,
		aux: data.aux,
		weight: data.weight,
		target: getFieldWithDot( data.target ),
		port: data.port,
		protocol: data.protocol,
		ttl: data.ttl,
	} ),
};
