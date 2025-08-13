import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
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
import { useEffect, useState } from 'react';
import { domainDnsMutation, domainDnsQuery } from '../../../app/queries/domain-dns-records';
import { domainRoute } from '../../../app/routes/domain-routes';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RequiredSelect from '../../../components/required-select';
import { DNS_RECORD_CONFIGS } from './dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './dns-record-configs';

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

	const router = useRouter();
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const { recordId } = domainRoute.useSearch();
	const mutation = useMutation( domainDnsMutation( domainName ) );
	const { isPending } = mutation;

	const currentPath = router.state.location.pathname;
	const isEditMode = currentPath.includes( '/dns/edit' );

	const { data: dnsRecords } = useQuery( domainDnsQuery( domainName ) );
	const recordToEdit = dnsRecords?.records.find( ( record ) => record.id === recordId );

	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

	// When editing a DNS record, check if the record exists and populate the form
	useEffect( () => {
		if ( ! isEditMode || ! recordToEdit ) {
			return;
		}

		const formData = {
			type: recordToEdit.type,
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
		setTypeFormData( { type: recordToEdit.type } );
		setFormData( formData );
	}, [ isEditMode, recordToEdit ] );

	if ( isEditMode && ! recordToEdit ) {
		createErrorNotice( __( 'Invalid DNS record to edit.' ) );
		navigateToDNSOverviewPage();
		return;
	}

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const formattedData = config.transformData( formData, domainName );

		const recordsToAdd: DnsRecordFormData[] = [ formattedData ];
		let recordsToRemove: DnsRecordFormData[] = [];
		const successMessage = isEditMode
			? __( 'DNS record updated successfully.' )
			: __( 'DNS record added successfully.' );
		const errorMessage = isEditMode
			? __( 'Failed to update DNS record.' )
			: __( 'Failed to add DNS record.' );

		if ( isEditMode ) {
			recordsToRemove = [ recordToEdit ];
		}

		mutation.mutate(
			{ recordsToAdd, recordsToRemove },
			{
				onSuccess: () => {
					createSuccessNotice( successMessage, { type: 'snackbar' } );
					navigateToDNSOverviewPage();
				},
				onError: () => {
					// TODO: Get DNS exception class and display correct error message
					createErrorNotice( errorMessage, {
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

	const headerTitle = isEditMode ? __( 'Edit DNS record' ) : __( 'Add a new DNS record' );
	const buttonText = isEditMode ? __( 'Update DNS record' ) : __( 'Add DNS record' );

	return (
		<PageLayout size="small" header={ <PageHeader title={ headerTitle } /> }>
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
									{ buttonText }
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
