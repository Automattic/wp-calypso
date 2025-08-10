import { __ } from '@wordpress/i18n';
import RequiredSelect from '../../../components/required-select';
import type { DNSRecordFormData, DNSRecordConfig } from './types';

export const CAARecordConfig: DNSRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			placeholder: __( 'Enter subdomain' ),
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
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
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
	transformData: ( data: DNSRecordFormData ) => ( {
		type: 'CAA',
		name: data.name,
		flags: data.flags,
		tag: data.tag,
		value: data.data,
		ttl: data.ttl,
	} ),
};
