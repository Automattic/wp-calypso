import { __ } from '@wordpress/i18n';
import type { AddDNSRecordFormData, DNSRecordConfig } from './types';

export const CAARecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: 'Enter subdomain',
		},
		{
			id: 'flags',
			type: 'integer',
			label: __( 'Flag' ),
			placeholder: 'e.g. 0',
			isValid: {
				required: true,
			},
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
			type: 'text',
			label: __( 'Value' ),
			placeholder: 'e.g. "letsencrypt.org"',
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
