import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
// import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
// import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
// import { useAuth } from '../../app/auth';
import { domainQuery } from '../../app/queries/domain';
// import { domainTransferToOtherUserMutation } from '../../app/queries/domain-transfer';
// import { siteUsersQuery } from '../../app/queries/site-users';
import { domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { DomainSubtype } from '../../data/domains';
// import { SiteUser } from '../../data/site-users';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain';
import type { Field } from '@wordpress/dataviews';

export type TransferFormData = {
	email: string;
};

const fields: Field< TransferFormData >[] = [
	{
		id: 'email',
		label: __( 'Enter domain recipient’s email for transfer' ),
		type: 'email' as const,
		isValid: {
			required: true,
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'email' ],
};

export default function TransferDomainToOtherUser() {
	const { domainName } = domainRoute.useParams() as { domainName: string };
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	// const { data: users } = useSuspenseQuery( siteUsersQuery( domain.blog_id ) );
	// const { user: currentUser } = useAuth();
	// const { mutate: domainTransferToOtherUser, isPending: isDomainTransferringToOtherUser } =
	// useMutation( domainTransferToOtherUserMutation( domainName, domain.blog_id, currentUser.ID ) );
	// const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState( {
		email: '',
	} );

	const hasEmailWithUs = hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain );

	// const isSaveDisabled = ! isItemValid( formData, fields, form );

	// const filterAvailableUsers = ( users: SiteUser[] ) => {
	// 	return users.filter( ( user ) => {
	// 		console.log( user );
	// 		const userId = user.linked_user_ID ?? user.id;
	// 		return userId !== false && userId !== currentUser.ID;
	// 	} );
	// };

	// const availableUsers = filterAvailableUsers( users );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		// domainTransferToOtherUser( currentUser.ID, {
		// 	onSuccess: () => {
		// 		createSuccessNotice(
		// 			__( 'A domain transfer request has been emailed to the recipient’s address.' )
		// 		);
		// 	},
		// 	onError: () => {
		// 		createErrorNotice( __( 'An error occurred while initiating the domain transfer.' ) );
		// 	},
		// 	onSettled: () => {
		// 		setFormData( { userId: '' } );
		// 	},
		// } );
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
			<VStack spacing={ 2 }>
				<Text as="p">
					{ createInterpolateElement(
						/* Translators: domain is the domain name */
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
				{ hasEmailWithUs && (
					<Text as="p">
						{ sprintf(
							/* Translators: %s: domainName is the domain name */
							__(
								'The email subscription for %(domainName)s will be transferred along with the domain.'
							),
							{ domainName }
						) }
					</Text>
				) }
			</VStack>
		);
	};

	const renderTransferConnectionMessage = () => {
		return (
			<VStack spacing={ 2 }>
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
				{ hasEmailWithUs && (
					<Text as="p">
						{ sprintf(
							/* Translators: %s: domainName is the domain name */
							__(
								'The email subscription for %(domainName)s will be transferred along with the domain.'
							),
							{ domainName }
						) }
					</Text>
				) }
			</VStack>
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
								// isBusy={ isUpdatingDomainTransferRequest }
								// disabled={ isSaveDisabled || isUpdatingDomainTransferRequest }
							>
								{ __( 'Transfer Domain' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</VStack>
		);
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Transfer to another user' ) } /> }>
			<Card>
				<CardBody>
					<VStack spacing={ 3 }>
						<SectionHeader title={ __( 'Confirm new owner' ) } />
						{ domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
							? renderTransferRegistrationMessage()
							: renderTransferConnectionMessage() }
						{ renderTransferForm() }
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
