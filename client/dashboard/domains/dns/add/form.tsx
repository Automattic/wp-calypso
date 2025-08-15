import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainDnsMutation } from '../../../app/queries/domain-dns-records';
import { domainRoute } from '../../../app/routes/domain-routes';
import RequiredSelect from '../../../components/required-select';
import { DNS_RECORD_CONFIGS } from './dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './dns-record-configs';
import type { DnsRecord } from '../../../data/domain-dns-records';

const typeForm = {
	type: 'regular' as const,
	fields: [ 'type' ],
};

const defaultFormData = {
	type: 'A',
	name: '',
	data: '',
	ttl: 3600,
	flags: 0, // CAA
	tag: 'issue', // CAA
	aux: 10, // MX, SRV
	service: 'sip', // SRV
	protocol: '_tcp', // SRV
	weight: 10, // SRV
	target: '', // SRV
	port: 5060, // SRV
};

interface DNSRecordFormProps {
	submitButtonText: string;
	onSubmit: ( typeFormData: DnsRecordTypeFormData, formData: DnsRecordFormData ) => void;
	recordToEdit?: DnsRecord;
}

export default function DNSRecordForm( {
	submitButtonText,
	onSubmit,
	recordToEdit,
}: DNSRecordFormProps ) {
	const [ typeFormData, setTypeFormData ] = useState< DnsRecordTypeFormData >( () => {
		if ( recordToEdit ) {
			return { type: recordToEdit.type };
		}
		return { type: 'A' };
	} );
	const [ formData, setFormData ] = useState< DnsRecordFormData >( () => {
		if ( recordToEdit ) {
			return {
				// type: recordToEdit.type,
				ttl: recordToEdit.ttl as number,
				name: recordToEdit.name || '',
				data: recordToEdit.data || '',
				flags: recordToEdit.flags || 0,
				tag: recordToEdit.tag || '',
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
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
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

	const navigate = useNavigate();
	const { domainName } = domainRoute.useParams();
	const mutation = useMutation( domainDnsMutation( domainName ) );
	const { isPending } = mutation;

	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

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
							data={ formData }
							fields={ config.fields }
							form={ config.form }
							onChange={ ( edits: Partial< DnsRecordFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<HStack justify="flex-start">
							<Button variant="primary" type="submit" isBusy={ isPending } disabled={ isPending }>
								{ submitButtonText }
							</Button>
							<Button type="button" disabled={ isPending } onClick={ handleCancel }>
								{ __( 'Cancel' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
