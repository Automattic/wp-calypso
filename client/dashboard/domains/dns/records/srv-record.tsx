import { __ } from '@wordpress/i18n';
import RequiredSelect from '../../../components/required-select';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const SRVRecordConfig: DnsRecordConfig = {
	description: __(
		'SRV (service) records define the information to access certain internet services.'
	),
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'service',
			type: 'text',
			label: __( 'Service' ),
			/* translators: This is a placeholder for a DNS SRV record `service` property */
			placeholder: __( 'e.g. sip' ),
		},
		{
			id: 'protocol',
			label: __( 'Protocol' ),
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
			elements: [
				{ label: '_tcp', value: '_tcp' },
				{ label: '_udp', value: '_udp' },
				{ label: '_tls', value: '_tls' },
			],
		},
		{
			id: 'aux',
			type: 'integer',
			label: __( 'Priority' ),
			/* translators: This is a placeholder for a DNS SRV record `priority` property */
			placeholder: __( 'e.g. 10' ),
		},
		{
			id: 'weight',
			type: 'integer',
			label: __( 'Weight' ),
			/* translators: This is a placeholder for a DNS SRV record `weight` property */
			placeholder: __( 'e.g. 10' ),
		},
		{
			id: 'target',
			type: 'text',
			label: __( 'Target host' ),
			/* translators: This is a placeholder for a DNS SRV record `target` property */
			placeholder: __( 'e.g. sip.your-provider.com' ),
		},
		{
			id: 'port',
			type: 'integer',
			label: __( 'Target port' ),
			/* translators: This is a placeholder for a DNS SRV record `port` property */
			placeholder: __( 'e.g. 5060' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS SRV record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'service', 'protocol', 'aux', 'weight', 'target', 'port', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => {
		// Remove trailing dot from the hostname
		const target = data.target.endsWith( '.' ) ? data.target.slice( 0, -1 ) : data.target;

		return {
			type: 'SRV',
			name: data.name,
			service: data.service,
			aux: data.aux,
			weight: data.weight,
			target: target + '.', // we're appending a dot to make the host name a FQDN
			port: data.port,
			protocol: data.protocol,
			ttl: data.ttl,
		};
	},
};
