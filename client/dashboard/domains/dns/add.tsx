import { useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainAddDNSRecordMutation } from '../../app/queries/domain-add-dns';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

type AddDNSRecordFormData = {
	type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';
	name: string;
	data: string;
	ttl: number;
};

const fields: Field< AddDNSRecordFormData >[] = [
	{
		id: 'type',
		label: __( 'Type' ),
		Edit: 'select',
		elements: [
			{ label: __( 'A' ), value: 'A' },
			{ label: __( 'AAAA' ), value: 'AAAA' },
			{ label: __( 'ALIAS' ), value: 'ALIAS' },
			{ label: __( 'CAA' ), value: 'CAA' },
			{ label: __( 'CNAME' ), value: 'CNAME' },
			{ label: __( 'MX' ), value: 'MX' },
			{ label: __( 'NS' ), value: 'NS' },
			{ label: __( 'SRV' ), value: 'SRV' },
			{ label: __( 'TXT' ), value: 'TXT' },
		],
	},
	{
		id: 'name',
		label: __( 'Name' ),
		Edit: 'text',
	},
	{
		id: 'data', // "points to"
		label: __( 'Points to' ),
		Edit: 'text',
	},
	{
		id: 'ttl',
		label: __( 'TTL (time to live)' ),
		Edit: 'text',
	},
];

const form = {
	type: 'regular' as const,
	fields: [ 'type', 'name', 'data', 'ttl' ],
};

export default function DomainAddDNS() {
	const [ formData, setFormData ] = useState< AddDNSRecordFormData >( {
		type: 'A',
		name: '',
		data: '',
		ttl: 3600,
	} );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const mutation = useMutation( domainAddDNSRecordMutation( domainName ) );
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData, {
			onSuccess: () => {
				createSuccessNotice( __( 'DNS record added successfully.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to add DNS record.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title="Add a new DNS record" /> }>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< AddDNSRecordFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< AddDNSRecordFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<HStack justify="flex-start">
								<Button variant="primary" type="submit" isBusy={ isPending }>
									{ __( 'Add DNS record' ) }
								</Button>
								<Button type="button">{ __( 'Cancel' ) }</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
