import { DNS_RECORD_TYPES } from '@automattic/api-core';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	RadioControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { DNS_RECORD_CONFIGS } from './records/dns-record-configs';
import type { DnsRecordType } from '@automattic/api-core';
import './record-type-picker.scss';

const COMMON_RECORD_TYPES: DnsRecordType[] = [ 'A', 'CNAME', 'MX', 'TXT' ];

// TXT and CNAME are often offered side by side for the same verification, so explain which to pick.
const getVerificationHint = ( type: DnsRecordType ) => {
	switch ( type ) {
		case 'TXT':
			return __(
				'Some providers offer a TXT or a CNAME for the same verification. Either works, and TXT is the usual choice: it only holds text and changes nothing else about the domain.'
			);
		case 'CNAME':
			return __(
				'Some providers offer a CNAME or a TXT for the same verification. Either works, but a CNAME takes over everything at that subdomain, so use TXT unless the provider asks for a CNAME.'
			);
		default:
			return null;
	}
};

interface RecordTypePickerProps {
	value: DnsRecordType;
	disabled?: boolean;
	onChange: ( type: DnsRecordType ) => void;
}

export default function RecordTypePicker( { value, disabled, onChange }: RecordTypePickerProps ) {
	const [ showAllTypes, setShowAllTypes ] = useState( ! COMMON_RECORD_TYPES.includes( value ) );

	const types = [
		...COMMON_RECORD_TYPES,
		...( showAllTypes
			? DNS_RECORD_TYPES.filter( ( type ) => ! COMMON_RECORD_TYPES.includes( type ) )
			: [] ),
	];
	const hint = getVerificationHint( value );

	return (
		<VStack spacing={ 3 } alignment="flex-start">
			<RadioControl
				className="dns-record-type-picker"
				label={ __( 'What kind of record?' ) }
				selected={ value }
				disabled={ disabled }
				onChange={ ( type ) => onChange( type as DnsRecordType ) }
				options={ types.map( ( type ) => ( {
					value: type,
					label: type,
					description: DNS_RECORD_CONFIGS[ type ].description,
				} ) ) }
			/>
			{ ! showAllTypes && (
				<Button
					variant="tertiary"
					size="compact"
					onClick={ () => setShowAllTypes( true ) }
					disabled={ disabled }
					__next40pxDefaultSize
				>
					{ __( 'Show all record types' ) }
				</Button>
			) }
			{ hint && (
				<Text variant="muted" as="p">
					{ hint }
				</Text>
			) }
		</VStack>
	);
}
