import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { DNS_RECORD_CONFIGS } from './records/dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './records/dns-record-configs';
import type { DnsRecord, DnsRecordType } from '@automattic/api-core';

const typeForm = {
	layout: { type: 'regular' as const },
	fields: [ 'type' ],
};

interface DNSRecordFormProps {
	domainName: string;
	isBusy: boolean;
	recordToEdit?: DnsRecord;
	submitButtonText: string;
	onSubmit: ( typeFormData: DnsRecordTypeFormData, formData: DnsRecordFormData ) => void;
	navigateToDNSOverviewPage: () => void;
}

export default function DNSRecordForm( {
	domainName,
	isBusy,
	recordToEdit,
	submitButtonText,
	onSubmit,
	navigateToDNSOverviewPage,
}: DNSRecordFormProps ) {
	const defaultFormData = {
		type: 'A' as DnsRecordType,
		domain: domainName,
		name: '',
		data: '',
		ttl: 3600,
		flags: 0, // CAA
		tag: 'issue', // CAA
		value: '', // CAA
		aux: 10, // MX, SRV
		service: 'sip', // SRV
		protocol: '_tcp', // SRV
		weight: 10, // SRV
		target: '', // SRV
		port: 5060, // SRV
	};

	const [ typeFormData, setTypeFormData ] = useState< DnsRecordTypeFormData >( () => {
		if ( recordToEdit ) {
			return { type: recordToEdit.type };
		}
		return { type: 'A' };
	} );
	const [ formData, setFormData ] = useState< DnsRecordFormData >( () => {
		if ( recordToEdit ) {
			return {
				type: recordToEdit.type || ( 'A' as DnsRecordType ),
				domain: domainName,
				ttl: recordToEdit.ttl || 3600,
				name: recordToEdit.name || '',
				data: recordToEdit.data || '',
				flags: recordToEdit.flags || 0,
				tag: recordToEdit.tag || '',
				value: recordToEdit.value || '',
				aux: recordToEdit.aux || 0,
				service: recordToEdit.service || '',
				protocol: recordToEdit.protocol || '',
				weight: recordToEdit.weight || 0,
				target: recordToEdit.target || '',
				port: recordToEdit.port || 0,
			};
		}
		return defaultFormData;
	} );

	const config = DNS_RECORD_CONFIGS[ typeFormData.type ];

	const typeFields: Field< DnsRecordTypeFormData >[] = [
		{
			id: 'type',
			label: __( 'Type' ),
			Edit: 'select',
			elements: [
				{ label: 'A', value: 'A' },
				{ label: 'AAAA', value: 'AAAA' },
				{ label: 'ALIAS', value: 'ALIAS' },
				{ label: 'CAA', value: 'CAA' },
				{ label: 'CNAME', value: 'CNAME' },
				{ label: 'MX', value: 'MX' },
				{ label: 'NS', value: 'NS' },
				{ label: 'SRV', value: 'SRV' },
				{ label: 'TXT', value: 'TXT' },
			],
			description: config.description,
		},
	];

	const handleCancel = ( e: React.MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		navigateToDNSOverviewPage();
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( typeFormData, formData );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< DnsRecordTypeFormData >
							data={ typeFormData }
							fields={ typeFields }
							form={ typeForm }
							onChange={ ( edits: Partial< DnsRecordTypeFormData > ) => {
								setTypeFormData( ( data ) => ( { ...data, ...edits } ) );
								// Reset form data when changing record type
								setFormData( defaultFormData );
							} }
						/>
						<DataForm< DnsRecordFormData >
							// This key prop is used to force a form re-render when the record type is changed
							// Othewise, the fields that have validation errors will not have validation reset
							key={ typeFormData.type }
							data={ formData }
							fields={ config.fields }
							form={ config.form }
							onChange={ ( edits: Partial< DnsRecordFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack justify="flex-start">
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isBusy }
								disabled={ isBusy }
							>
								{ submitButtonText }
							</Button>
							<Button
								__next40pxDefaultSize
								type="button"
								disabled={ isBusy }
								onClick={ handleCancel }
							>
								{ __( 'Cancel' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
