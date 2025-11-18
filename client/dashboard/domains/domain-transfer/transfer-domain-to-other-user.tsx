import { DomainSubtype, type SiteUser } from '@automattic/api-core';
import { domainQuery, domainTransferToUserMutation, siteUsersQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute, domainsRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import type { Field } from '@wordpress/dataviews';

export type TransferFormData = {
	user: string;
};

const createFields = ( users: SiteUser[] ): Field< TransferFormData >[] => [
	{
		id: 'user',
		label: __( 'New owner' ),
		elements:
			users.length > 0
				? [
						{ value: '', label: __( 'Choose an administrator on this site' ) },
						...users.map( ( user ) => ( {
							value: user.id,
							label: user.name,
						} ) ),
				  ]
				: [ { value: '', label: '--' + __( 'Site has no other administrators' ) + '--' } ],
		isValid: {
			required: true,
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'user' ],
};

export default function TransferDomainToOtherUser() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: users } = useSuspenseQuery( siteUsersQuery( domain.blog_id ) );
	const { user: currentUser } = useAuth();
	const { mutate: domainTransferToOtherUser, isPending: isDomainTransferringToOtherUser } =
		useMutation( domainTransferToUserMutation( domainName, domain.blog_id ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState( {
		user: '',
	} );
	const router = useRouter();
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	const availableUsers = useMemo( () => {
		return users.filter( ( user: SiteUser ) => {
			return user.id !== currentUser.ID;
		} );
	}, [ users, currentUser.ID ] );
	const fields = useMemo( () => {
		return createFields( availableUsers );
	}, [ availableUsers ] );

	const isMapping = domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		setIsDialogOpen( true );
	};

	const onConfirm = () => {
		const selectedUser = availableUsers.find(
			( user ) => ( user.id as unknown as string ) === formData.user
		);
		domainTransferToOtherUser( formData.user, {
			onSuccess: () => {
				createSuccessNotice(
					sprintf(
						/* Translators: %s: domainName is the domain name, %s: selectedUserDisplay is the selected user display */
						__( '%(selectedDomainName)s has been transferred to %(selectedUserDisplay)s' ),
						{ args: { selectedDomainName: domainName, selectedUserDisplay: selectedUser?.name } }
					)
				);
				setIsDialogOpen( false );
				router.navigate( { to: domainsRoute.fullPath, params: { domainName } } );
			},
			onError: () => {
				createErrorNotice(
					sprintf(
						/* Translators: %s: domainName is the domain name */
						__( 'Failed to transfer %(selectedDomainName)s, please try again or contact support.' ),
						{ args: { selectedDomainName: domainName } }
					)
				);
				setIsDialogOpen( false );
			},
		} );
	};

	const renderTransferNotice = () => {
		return (
			<Notice variant="info">
				{ createInterpolateElement(
					__(
						'By clicking Transfer domain, you agree to the <domainRegistrationAgreement>Domain Registration Agreement</domainRegistrationAgreement> and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your <designatedAgent>Designated Agent</designatedAgent>.'
					),
					{
						domainRegistrationAgreement: (
							<ExternalLink
								href="https://wordpress.com/automattic-domain-name-registration-agreement/"
								children={ null }
							/>
						),
						designatedAgent: <InlineSupportLink supportContext="domain-designated-agent" />,
					}
				) }
			</Notice>
		);
	};

	const renderTransferRegistrationMessage = () => {
		return (
			<VStack spacing={ 4 }>
				<Text as="p">
					{ createInterpolateElement(
						/* Translators: <domain/> is the domain name */
						__(
							'Transferring a domain to another user will give all the rights of the domain to that user. Please choose an administrator to transfer <domain/> to.'
						),
						{ domain: <strong>{ domainName }</strong> }
					) }
				</Text>
				<Text as="p">
					{ createInterpolateElement(
						__(
							'You can transfer this domain to any administrator on this site. If the user you want to transfer is not currently an administrator, please <link>add them to the site first</link>.'
						),
						{
							link: <a href={ `/people/new/${ domain.site_slug }` } />,
						}
					) }
				</Text>
			</VStack>
		);
	};

	const renderTransferConnectionMessage = () => {
		return (
			<VStack spacing={ 4 }>
				<Text as="p">
					{ createInterpolateElement(
						/* Translators: domain is the domain name */
						__( 'Please choose an administrator to transfer domain connection of <domain/> to.' ),
						{ domain: <strong>{ domainName }</strong> }
					) }
				</Text>
				<Text as="p">
					{ createInterpolateElement(
						__(
							'You can transfer this domain connection to any administrator on this site. If the user you want to transfer is not currently an administrator, please <link>add them to the site first</link>.'
						),
						{
							link: <a href={ `/people/new/${ domain.site_slug }` } />,
						}
					) }
				</Text>
			</VStack>
		);
	};

	const renderConfirmationDialog = () => {
		const selectedUser = availableUsers.find( ( user ) => user.id.toString() === formData.user );

		return (
			<Modal title={ __( 'Confirm transfer' ) } onRequestClose={ () => setIsDialogOpen( false ) }>
				<VStack spacing={ 6 }>
					<Text>
						{ createInterpolateElement(
							isMapping
								? __(
										'Do you want to transfer the domain connection of <domainName/> to <selectedUserDisplay/>?'
								  )
								: __(
										'Do you want to transfer the ownership of <domainName/> to <selectedUserDisplay/>?'
								  ),
							{
								domainName: <strong>{ domainName }</strong>,
								selectedUserDisplay: <strong>{ selectedUser?.name }</strong>,
							}
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ () => setIsDialogOpen( false ) }
							disabled={ isDomainTransferringToOtherUser }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isDestructive
							isBusy={ isDomainTransferringToOtherUser }
							onClick={ onConfirm }
							disabled={ isDomainTransferringToOtherUser }
						>
							{ __( 'Confirm transfer' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		);
	};

	const renderTransferForm = () => {
		return (
			<VStack spacing={ 8 }>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< TransferFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< TransferFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						{ renderTransferNotice() }
						<HStack justify="flex-start">
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								disabled={ formData.user === '' }
							>
								{ isMapping ? __( 'Transfer domain connection' ) : __( 'Transfer domain' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</VStack>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Transfer to another user' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 3 }>
						<SectionHeader title={ __( 'Confirm new owner' ) } />
						<VStack spacing={ 4 }>
							{ isMapping
								? renderTransferConnectionMessage()
								: renderTransferRegistrationMessage() }
							{ renderTransferForm() }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
			{ isDialogOpen && renderConfirmationDialog() }
		</PageLayout>
	);
}
