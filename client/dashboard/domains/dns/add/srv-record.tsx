import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const SRVRecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'service',
			label: __( 'Service' ),
			Edit: 'text',
			placeholder: 'e.g. sip',
		},
		{
			id: 'protocol',
			label: __( 'Protocol' ),
			Edit: 'select',
			elements: [
				{ label: __( '_tcp' ), value: '_tcp' },
				{ label: __( '_udp' ), value: '_udp' },
				{ label: __( '_tls' ), value: '_tls' },
			],
		},
		{
			id: 'aux',
			label: __( 'Priority' ),
			Edit: 'text',
			placeholder: 'e.g. 10',
		},
		{
			id: 'weight',
			label: __( 'Weight' ),
			Edit: 'text',
			placeholder: 'e.g. 10',
		},
		{
			id: 'target',
			label: __( 'Target host' ),
			Edit: 'text',
			placeholder: 'e.g. sip.your-provider.com',
		},
		{
			id: 'port',
			label: __( 'Target port' ),
			Edit: 'text',
			placeholder: 'e.g. 5060',
		},
		{
			id: 'ttl',
			label: __( 'TTL (time to live)' ),
			Edit: 'text',
			placeholder: 'e.g. 3600',
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'service', 'protocol', 'aux', 'weight', 'target', 'port', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'SRV',
		name: data.name,
		service: data.service,
		aux: data.aux,
		weight: data.weight,
		target: data.target,
		port: data.port,
		protocol: data.protocol,
		ttl: data.ttl,
	} ),
};
