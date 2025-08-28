import { __ } from '@wordpress/i18n';
import RequiredSelect from '../../../components/required-select';
import { getNormalizedName } from '../utils';
import {
	hostnameValidator,
	numberRangeValidator,
	stringLengthValidator,
	ttlValidator,
} from './validators';
import type { DnsRecordFormData, DnsRecordConfig } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

export const CAARecordConfig: DnsRecordConfig = {
	fields: [
		{
			id: 'name',
			type: 'text',
			label: __( 'Name (optional)' ),
			/* translators: This is a placeholder for a DNS CAA record `name` property */
			placeholder: __( 'Enter subdomain' ),
			isValid: {
				custom: hostnameValidator(),
			},
		},
		{
			id: 'flags',
			type: 'integer',
			label: __( 'Flag' ),
			/* translators: This is a placeholder for a DNS CAA record `flags` property */
			placeholder: __( 'e.g. 0' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `flags` field of a DNS CAA record is invalid */
				custom: numberRangeValidator( 0, 255, __( 'Please enter a valid flags value.' ) ),
			},
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
			isValid: {
				required: true,
			},
		},
		{
			id: 'value',
			type: 'text',
			label: __( 'Value' ),
			/* translators: This is a placeholder for a DNS CAA record `value` property */
			placeholder: __( 'e.g. "letsencrypt.org"' ),
			isValid: {
				required: true,
				/* translators: This is the error message when the `value` field of a DNS CAA record is invalid */
				custom: stringLengthValidator( __( 'Please enter a valid value.' ) ),
			},
		},
		{
			id: 'ttl',
			type: 'integer',
			label: __( 'TTL (time to live)' ),
			/* translators: This is a placeholder for a DNS CAA record `ttl` property */
			placeholder: __( 'e.g. 3600' ),
			isValid: {
				required: true,
				custom: ttlValidator(),
			},
		},
	],
	form: {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'flags', 'tag', 'value', 'ttl' ],
	},
	transformData: ( data: DnsRecordFormData, domainName: string, type: DnsRecordType ) => ( {
		type: 'CAA',
		name: getNormalizedName( data.name, type, domainName ),
		flags: data.flags,
		tag: data.tag,
		value: data.value,
		ttl: data.ttl,
	} ),
};
