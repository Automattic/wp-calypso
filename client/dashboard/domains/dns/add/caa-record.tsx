import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const CAARecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			label: __( 'Name (optional)' ),
			Edit: 'text',
			placeholder: 'Enter subdomain',
		},
		{
			id: 'flags',
			label: __( 'Flag' ),
			Edit: 'text',
			placeholder: 'e.g. 0',
		},
		{
			id: 'tag',
			label: __( 'Tag' ),
			Edit: 'select',
			elements: [
				{ label: __( 'issue' ), value: 'issue' },
				{ label: __( 'issuewild' ), value: 'issuewild' },
				{ label: __( 'issueemail' ), value: 'issueemail' },
				{ label: __( 'iodef' ), value: 'iodef' },
			],
		},
		{
			id: 'data',
			label: __( 'Value' ),
			Edit: 'text',
			placeholder: 'e.g. "letsencrypt.org"',
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
		fields: [ 'name', 'flags', 'tag', 'data', 'ttl' ],
	},
	transformData: ( data: AddDNSRecordFormData ) => ( {
		type: 'CAA',
		name: data.name,
		flags: data.flags,
		tag: data.tag,
		value: data.data,
		ttl: data.ttl,
	} ),
};
