import {
	domainQuery,
	domainTransferRequestQuery,
	updateDomainTransferRequestMutation,
	deleteDomainTransferRequestMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { useLocale } from '../../app/locale';
import { domainRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { formatDate } from '../../utils/datetime';
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

export default function TransferDomainToAnyUser() {
	const { domainName } = domainRoute.useParams() as { domainName: string };
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainTransferRequest } = useSuspenseQuery(
		domainTransferRequestQuery( domainName, domain.site_slug )
	);
	const { mutate: deleteDomainTransferRequest, isPending: isDeletingDomainTransferRequest } =
		useMutation( {
			...deleteDomainTransferRequestMutation( domainName, domain.site_slug ),
			meta: {
				snackbar: {
					success: __( 'Domain transfer cancelled.' ),
					error: __( 'Failed to cancel domain transfer.' ),
				},
			},
		} );
	const { mutate: updateDomainTransferRequest, isPending: isUpdatingDomainTransferRequest } =
		useMutation( {
			...updateDomainTransferRequestMutation( domainName, domain.site_slug ),
			meta: {
				snackbar: {
					success: __( 'A domain transfer request has been emailed to the recipient’s address.' ),
					error: __( 'Failed to initiate domain transfer.' ),
				},
			},
		} );
	const locale = useLocale();
	const transferEmail = domainTransferRequest?.email;
	const requestedAt = domainTransferRequest?.requested_at;

	const [ formData, setFormData ] = useState( {
		email: '',
	} );
	const [ isTransferDialogOpen, setIsTransferDialogOpen ] = useState( false );
	const [ isCancelDialogOpen, setIsCancelDialogOpen ] = useState( false );

	const hasEmailWithUs = hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		setIsTransferDialogOpen( true );
	};

	const onConfirm = () => {
		updateDomainTransferRequest( formData.email, {
			onSettled: () => {
				setIsTransferDialogOpen( false );
				setFormData( { email: '' } );
			},
		} );
	};

	const handleCancelTransfer = () => {
		setIsCancelDialogOpen( true );
	};

	const onConfirmCancel = () => {
		deleteDomainTransferRequest( undefined, {
			onSettled: () => {
				setIsCancelDialogOpen( false );
			},
		} );
	};

	const renderTransferNotice = () => {
		return (
			<Notice variant="info">
				{ __(
					'Transferring a domain to another user will give all the rights of this domain to that user. You will no longer be able to manage the domain.'
				) }
			</Notice>
		);
	};

	const renderTransferForm = () => {
		return (
			<VStack spacing={ 8 }>
				<VStack spacing={ 2 }>
					<Text as="p">
						{ createInterpolateElement(
							/* Translators: %s: domain is the domain name */
							__(
								'You can transfer <domain/> to any WordPress.com user. If the user does not have a WordPress.com account, they will be prompted to create one.'
							),
							{ domain: <strong>{ domainName }</strong> }
						) }
					</Text>
					<Text as="p">
						{ __(
							'The recipient will need to provide updated contact information and accept the request before the domain transfer can be completed.'
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
								isBusy={ isUpdatingDomainTransferRequest }
								disabled={ isSaveDisabled || isUpdatingDomainTransferRequest }
							>
								{ __( 'Transfer domain' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</VStack>
		);
	};

	const renderConfirmationDialog = () => {
		return (
			<Modal
				title={ __( 'Confirm Transfer' ) }
				onRequestClose={ () => setIsTransferDialogOpen( false ) }
			>
				<VStack spacing={ 6 }>
					<Text>
						{ createInterpolateElement(
							__( 'Do you want to transfer the ownership of <domainName/> to <recipientEmail/>?' ),
							{
								domainName: <strong>{ domainName }</strong>,
								recipientEmail: <strong>{ formData.email }</strong>,
							}
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ () => setIsTransferDialogOpen( false ) }
							disabled={ isUpdatingDomainTransferRequest }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isDestructive
							isBusy={ isUpdatingDomainTransferRequest }
							onClick={ onConfirm }
							disabled={ isUpdatingDomainTransferRequest }
						>
							{ __( 'Confirm transfer' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		);
	};

	const renderCancelConfirmationDialog = () => {
		return (
			<Modal
				title={ __( 'Confirm Cancel Transfer' ) }
				onRequestClose={ () => setIsCancelDialogOpen( false ) }
			>
				<VStack spacing={ 6 }>
					<Text>
						{ createInterpolateElement(
							__( 'Are you sure you want to cancel the transfer request for <domainName/>?' ),
							{
								domainName: <strong>{ domainName }</strong>,
							}
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ () => setIsCancelDialogOpen( false ) }
							disabled={ isDeletingDomainTransferRequest }
						>
							{ __( 'Keep transfer' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isDestructive
							isBusy={ isDeletingDomainTransferRequest }
							onClick={ onConfirmCancel }
							disabled={ isDeletingDomainTransferRequest }
						>
							{ __( 'Cancel transfer' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		);
	};

	const renderCancelTransfer = () => {
		const expiresAt = new Date( requestedAt || '' );
		expiresAt.setHours( expiresAt.getHours() + 24 );

		return (
			<VStack spacing={ 8 }>
				<Text as="p">
					{ createInterpolateElement(
						/* Translators: <domain/> is the domain name wrapped in a <strong> tag */
						__(
							'There’s a pending transfer request for <domain/>. If you wish to cancel the transfer, click the button below.'
						),
						{ domain: <strong>{ domainName }</strong> }
					) }
				</Text>
				<VStack spacing={ 4 }>
					<VStack>
						<Text size={ 14 } weight={ 500 }>
							{ __( 'Transfer recipient' ) }
						</Text>
						<Text>{ transferEmail }</Text>
					</VStack>
					<VStack>
						<Text size={ 14 } weight={ 500 }>
							{ __( 'Valid until' ) }
						</Text>
						<Text>{ formatDate( expiresAt, locale ) }</Text>
					</VStack>
				</VStack>
				<HStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isDeletingDomainTransferRequest }
						disabled={ isDeletingDomainTransferRequest }
						onClick={ handleCancelTransfer }
					>
						{ __( 'Cancel transfer' ) }
					</Button>
				</HStack>
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
						<SectionHeader
							title={ transferEmail ? __( 'Domain transfer pending' ) : __( 'Confirm new owner' ) }
						/>
						{ ! transferEmail && renderTransferForm() }
						{ transferEmail && renderCancelTransfer() }
					</VStack>
				</CardBody>
			</Card>
			{ isTransferDialogOpen && renderConfirmationDialog() }
			{ isCancelDialogOpen && renderCancelConfirmationDialog() }
		</PageLayout>
	);
}
