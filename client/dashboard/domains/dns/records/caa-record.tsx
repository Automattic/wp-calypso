import { __ } from '@wordpress/i18n';
import RequiredSelect from '../../../components/required-select';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';

export const CAARecordConfig: DnsRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS CAA record `name` property */
			placeholder: __( 'Enter subdomain' ),
		},
		{
			id: 'flags',
			type: 'integer',
			label: __( 'Flag' ),
			/* translators: This is a placeholder for a DNS CAA record `flags` property */
			placeholder: __( 'e.g. 0' ),
		},
		{
			id: 'tag',
			label: __( 'Tag' ),
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
			elements: [
				{ label: 'issue', value: 'issue' },
				{ label: 'issuewild', value: 'issuewild' },
				{ label: 'issueemail', value: 'issueemail' },
				{ label: 'iodef', value: 'iodef' },
			],
		},
		{
			id: 'data',
			type: 'text',
			label: __( 'Value' ),
			/* translators: This is a placeholder for a DNS CAA record `data` property */
			placeholder: __( 'e.g. "letsencrypt.org"' ),
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS CAA record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
		},
	],
	form: {
		type: 'regular',
		fields: [ 'name', 'flags', 'tag', 'data', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData ) => ( {
		type: 'CAA',
		name: data.name,
		flags: data.flags,
		tag: data.tag,
		value: data.data,
		ttl: data.ttl,
	} ),
};
