import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	DropdownMenu,
	Modal,
	TextControl,
} from '@wordpress/components';
import { pencil, rotateLeft, trash, moreVertical } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { useEdit, useResend, useRemove } from '../hooks';
import type { Mailbox } from '../../../../data/emails/types';

import './style.scss';

export const ActionsMenu = ( { mailbox }: { mailbox: Mailbox } ) => {
	const [ isRemoveOpen, setIsRemoveOpen ] = useState( false );
	const [ isEditOpen, setIsEditOpen ] = useState( false );
	const remove = useRemove( { mailbox } );
	const resend = useResend( { mailbox } );
	const { edit, isPending } = useEdit( { mailbox } );
	const translate = useTranslate();

	const currentDestination = getEmailForwardAddress( mailbox );

	const handleRemoveConfirm = () => {
		remove( mailbox.mailbox, mailbox.domain, currentDestination );
		setIsRemoveOpen( false );
	};

	const handleRemoveCancel = () => {
		setIsRemoveOpen( false );
	};

	const editControl = {
		title: translate( 'Edit', {
			comment: 'Edit email forward destination',
		} ) as string,
		icon: pencil,
		onClick: () => setIsEditOpen( true ),
	};

	const removeControl = {
		title: translate( 'Remove', {
			comment: 'Remove email forward',
		} ) as string,
		icon: trash,
		onClick: () => setIsRemoveOpen( true ),
	};

	const resendControl = {
		title: translate( 'Resend', {
			comment: 'Resend verification email',
		} ) as string,
		icon: rotateLeft,
		onClick: () => resend( mailbox.mailbox, mailbox.domain, currentDestination ),
	};

	const controls = mailbox.warnings?.length
		? [ editControl, resendControl, removeControl ]
		: [ editControl, removeControl ];

	return (
		<>
			<ConfirmDialog
				isOpen={ isRemoveOpen }
				onConfirm={ handleRemoveConfirm }
				onCancel={ handleRemoveCancel }
				cancelButtonText={ translate( 'Cancel' ) }
				confirmButtonText={ translate( 'Remove' ) }
			>
				<VStack>
					<Heading level={ 3 }>
						{ translate( 'Are you sure you want to remove this email forward?' ) }
					</Heading>
					<Text>
						{ translate(
							"This will remove it from our records and if it's not used in another forward, it will require reverification if added again."
						) }
					</Text>
				</VStack>
			</ConfirmDialog>
			{ isEditOpen && (
				<EditModal
					mailbox={ mailbox }
					currentDestination={ currentDestination }
					onEdit={ edit }
					isPending={ isPending }
					onClose={ () => setIsEditOpen( false ) }
				/>
			) }
			<DropdownMenu
				icon={ moreVertical }
				label={ translate( 'More options' ) }
				controls={ controls }
			/>
		</>
	);
};

function EditModal( {
	mailbox,
	currentDestination,
	onEdit,
	isPending,
	onClose,
}: {
	mailbox: Mailbox;
	currentDestination: string;
	onEdit: ( params: {
		mailbox: string;
		domain: string;
		destination: string;
		newDestination: string;
	} ) => Promise< unknown >;
	isPending: boolean;
	onClose: () => void;
} ) {
	const translate = useTranslate();
	const [ newDestination, setNewDestination ] = useState( currentDestination );

	const isUnchanged = newDestination.trim() === currentDestination;
	const isValid = emailValidator.validate( newDestination.trim() );

	const handleSave = async () => {
		await onEdit( {
			mailbox: mailbox.mailbox,
			domain: mailbox.domain,
			destination: currentDestination,
			newDestination: newDestination.trim(),
		} );
		onClose();
	};

	return (
		<Modal title={ translate( 'Edit email forward' ) } onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text>
					{ translate( 'Edit the forwarding destination for %(emailAddress)s.', {
						args: {
							emailAddress: `${ mailbox.mailbox }@${ mailbox.domain }`,
						},
					} ) }
				</Text>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'Forward to' ) }
					value={ newDestination }
					onChange={ setNewDestination }
					type="email"
					disabled={ isPending }
					help={
						! isUnchanged && newDestination.trim() && ! isValid
							? translate( 'Please enter a valid email address.' )
							: undefined
					}
				/>
				<HStack justify="right">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ onClose }
						disabled={ isPending }
						accessibleWhenDisabled
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ handleSave }
						isBusy={ isPending }
						disabled={ isPending || isUnchanged || ! isValid }
						accessibleWhenDisabled
					>
						{ translate( 'Save' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
