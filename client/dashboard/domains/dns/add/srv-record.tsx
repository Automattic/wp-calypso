import { __ } from '@wordpress/i18n';
import RequiredSelect from '../../../components/required-select';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const SRVRecordConfig: DNSRecordConfig = {
	description: __(
		'SRV (service) records define the information to access certain internet services.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: 'Enter subdomain',
		},
		{
			id: 'service',
			type: 'text',
			label: __( 'Service' ),
			placeholder: 'e.g. sip',
			isValid: {
				required: true,
			},
		},
		{
			id: 'protocol',
			label: __( 'Protocol' ),
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
			elements: [
				{ label: __( '_tcp' ), value: '_tcp' },
				{ label: __( '_udp' ), value: '_udp' },
				{ label: __( '_tls' ), value: '_tls' },
			],
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			placeholder: 'e.g. 10',
			isValid: {
				required: true,
			},
		},
		{
			id: 'weight',
			type: 'integer',
			label: __( 'Weight' ),
			placeholder: 'e.g. 10',
			isValid: {
				required: true,
			},
		},
		{
			id: 'target',
			type: 'text',
			label: __( 'Target host' ),
			placeholder: 'e.g. sip.your-provider.com',
			isValid: {
				required: true,
			},
		},
		{
			id: 'port',
			type: 'integer',
			label: __( 'Target port' ),
			placeholder: 'e.g. 5060',
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
		fields: [ 'name', 'service', 'protocol', 'aux', 'weight', 'target', 'port', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => {
		// Remove trailing dot from the hostname
		const target = data.target.endsWith( '.' ) ? data.target.slice( 0, -1 ) : data.target;

		return {
			type: 'SRV',
			name: data.name,
			service: data.service,
			aux: data.aux,
			weight: data.weight,
			target: target + '.', // we need a FQDN here
			port: data.port,
			protocol: data.protocol,
			ttl: data.ttl,
		};
	},
};
