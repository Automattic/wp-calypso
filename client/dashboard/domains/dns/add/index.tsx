import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainDnsMutation } from '../../../app/queries/domain-dns-records';
import { domainRoute } from '../../../app/routes/domain-routes';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RequiredSelect from '../../../components/required-select';
import { DNS_RECORD_CONFIGS } from './dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

const typeForm = {
	type: 'regular' as const,
	fields: [ 'type' ],
};

const defaultFormData = {
	type: 'A' as DnsRecordType,
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

export default function DomainAddDNS() {
	const [ typeFormData, setTypeFormData ] = useState< DnsRecordTypeFormData >( {
		type: 'A',
	} );
	const [ formData, setFormData ] = useState< DnsRecordFormData >( defaultFormData );

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
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const mutation = useMutation( domainDnsMutation( domainName ) );
	const { isPending } = mutation;

	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const formattedData = config.transformData( formData, domainName );

		mutation.mutate(
			{ recordsToAdd: [ formattedData ] },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'DNS record added successfully.' ), { type: 'snackbar' } );
					navigateToDNSOverviewPage();
				},
				onError: () => {
					// TODO: Get DNS exception class and display correct error message
					createErrorNotice( __( 'Failed to add DNS record.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const handleCancel = ( e: React.MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		navigateToDNSOverviewPage();
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Add a new DNS record' ) } /> }>
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
									{ __( 'Add DNS record' ) }
								</Button>
								<Button type="button" disabled={ isPending } onClick={ handleCancel }>
									{ __( 'Cancel' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
