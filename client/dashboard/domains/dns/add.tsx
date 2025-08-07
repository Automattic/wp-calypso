import { useMutation } from '@tanstack/react-query';
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
import { domainAddDNSRecordMutation } from '../../app/queries/domain-add-dns';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

type DNSRecordTypeFormData = {
	type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';
};

const typeFields: Field< DNSRecordTypeFormData >[] = [
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
];

const typeForm = {
	type: 'regular' as const,
	fields: [ 'type' ],
};

type AddDNSRecordFormData = {
	type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';
	name: string;
	data: string;
	ttl: number;
	flags: number; // CAA
	tag: string; // CAA
	aux: number; // MX
	service: string; // SRV
	protocol: string; // SRV
	weight: number; // SRV
	target: string; // SRV
	port: number; // SRV
};

const getFields = ( type: DNSRecordTypeFormData[ 'type' ] ): Field< AddDNSRecordFormData >[] => {
	switch ( type ) {
		case 'A':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'data',
					label: __( 'Points to' ),
					Edit: 'text',
					placeholder: 'e.g. 123.45.67.89',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'AAAA':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'data',
					label: __( 'Points to' ),
					Edit: 'text',
					placeholder: 'e.g. 2001:500:84::b',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'ALIAS':
			return [
				{
					id: 'data',
					label: __( 'Alias of (points to)' ),
					Edit: 'text',
					placeholder: 'e.g. example.com',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'CAA':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'flags',
					label: __( 'Flag' ),
					Edit: 'text',
					placeholder: 'e.g. 0',
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
					label: __( 'Value' ),
					Edit: 'text',
					placeholder: 'e.g. "letsencrypt.org"',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'CNAME':
			return [
				{
					id: 'name',
					label: __( 'Name (host)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain (required)',
				},
				{
					id: 'data',
					label: __( 'Alias of (points to)' ),
					Edit: 'text',
					placeholder: 'e.g. example.com',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'MX':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'data',
					label: __( 'Handled by' ),
					Edit: 'text',
					placeholder: 'e.g. mail.your-provider.com',
				},
				{
					id: 'aux',
					label: __( 'Priority' ),
					Edit: 'text',
					placeholder: 'e.g. 10',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'NS':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'data',
					label: __( 'Host' ),
					Edit: 'text',
					placeholder: 'e.g. ns1.your-provider.com',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'SRV':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'service',
					label: __( 'Service' ),
					Edit: 'text',
					placeholder: 'e.g. sip',
				},
				{
					id: 'protocol',
					label: __( 'Protocol' ),
					Edit: 'select',
					elements: [
						{ label: __( '_tcp' ), value: '_tcp' },
						{ label: __( '_udp' ), value: '_udp' },
						{ label: __( '_tls' ), value: '_tls' },
					],
				},
				{
					id: 'aux',
					label: __( 'Priority' ),
					Edit: 'text',
					placeholder: 'e.g. 10',
				},
				{
					id: 'weight',
					label: __( 'Weight' ),
					Edit: 'text',
					placeholder: 'e.g. 10',
				},
				{
					id: 'target',
					label: __( 'Target host' ),
					Edit: 'text',
					placeholder: 'e.g. sip.your-provider.com',
				},
				{
					id: 'port',
					label: __( 'Target port' ),
					Edit: 'text',
					placeholder: 'e.g. 5060',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
		case 'TXT':
			return [
				{
					id: 'name',
					label: __( 'Name (optional)' ),
					Edit: 'text',
					placeholder: 'Enter subdomain',
				},
				{
					id: 'data',
					label: __( 'Text' ),
					Edit: 'text',
					placeholder: 'e.g. "v=spf1 include:example.com ~all"',
				},
				{
					id: 'ttl',
					label: __( 'TTL (time to live)' ),
					Edit: 'text',
					placeholder: 'e.g. 3600',
				},
			];
	}
	return [];
};

const getForm = ( type: DNSRecordTypeFormData[ 'type' ] ) => {
	switch ( type ) {
		case 'A':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'ttl' ],
			};
		case 'AAAA':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'ttl' ],
			};
		case 'ALIAS':
			return {
				type: 'regular' as const,
				fields: [ 'data', 'ttl' ],
			};
		case 'CAA':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'flags', 'tag', 'data', 'ttl' ],
			};
		case 'CNAME':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'ttl' ],
			};
		case 'MX':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'aux', 'ttl' ],
			};
		case 'NS':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'ttl' ],
			};
		case 'SRV':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'service', 'protocol', 'aux', 'weight', 'target', 'port', 'ttl' ],
			};
		case 'TXT':
			return {
				type: 'regular' as const,
				fields: [ 'name', 'data', 'ttl' ],
			};
	}
	return {};
};

export default function DomainAddDNS() {
	const [ typeFormData, setTypeFormData ] = useState< DNSRecordTypeFormData >( {
		type: 'A',
	} );

	const [ formData, setFormData ] = useState< AddDNSRecordFormData >( {
		name: '',
		data: '',
		ttl: 3600,
		flags: 0, // CAA
		tag: 'issue', // CAA
		aux: 0, // MX, SRV
		service: '', // SRV
		protocol: '', // SRV
		weight: 0, // SRV
		target: '', // SRV
		port: 0, // SRV
	} );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const mutation = useMutation( domainAddDNSRecordMutation( domainName ) );
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		let formattedData = {};
		switch ( typeFormData.type ) {
			case 'A':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'AAAA':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'ALIAS':
				formattedData = {
					type: typeFormData.type,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'CAA':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					flags: formData.flags,
					tag: formData.tag,
					value: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'CNAME':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'MX':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					aux: formData.aux,
					ttl: formData.ttl,
				};
				break;
			case 'NS':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
			case 'SRV':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					service: formData.service,
					aux: formData.aux,
					weight: formData.weight,
					target: formData.target,
					port: formData.port,
					protocol: formData.protocol,
					ttl: formData.ttl,
				};
				break;
			case 'TXT':
				formattedData = {
					type: typeFormData.type,
					name: formData.name,
					data: formData.data,
					ttl: formData.ttl,
				};
				break;
		}

		mutation.mutate( formattedData, {
			onSuccess: () => {
				createSuccessNotice( __( 'DNS record added successfully.' ), { type: 'snackbar' } );
			},
			onError: ( error ) => {
				// TODO: Get DNS exception class and display correct error message
				createErrorNotice( __( 'Failed to add DNS record.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	console.log( 'formData = ', formData );

	return (
		<PageLayout size="small" header={ <PageHeader title="Add a new DNS record" /> }>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< DNSRecordTypeFormData >
								data={ typeFormData }
								fields={ typeFields }
								form={ typeForm }
								onChange={ ( edits: Partial< DNSRecordTypeFormData > ) => {
									setTypeFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<DataForm< AddDNSRecordFormData >
								data={ formData }
								fields={ getFields( typeFormData.type ) }
								form={ getForm( typeFormData.type ) }
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
