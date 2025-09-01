import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { domainTransferRoute } from '../../app/router/domains';
import { profileRoute } from '../../app/router/me';
import RouterLinkButton from '../../components/router-link-button';
import { Domain } from '../../data/domain';
import type { User } from '../../data/types';

type Step = 'intro' | 'warning' | 'confirm';

interface Props {
	user: User;
	domain: Domain;
	isOpen: boolean;
	closeDialog: () => void;
	onConfirm: () => void;
}

export default function RemoveDomainDialog( {
	user,
	domain,
	isOpen,
	onConfirm,
	closeDialog,
	...props
}: Props ) {
	const [ step, setStep ] = useState< Step >( 'intro' );
	const [ confirmInputValue, setConfirmInputValue ] = useState( '' );
	const [ domainConfirmed, setDomainConfirmed ] = useState( false );
	const isEmailBasedOnDomain = user.email.endsWith( domain.domain );

	const getTitle = useCallback( () => {
		switch ( step ) {
			case 'warning':
				return __( 'Update your WordPress.com email address' );
			case 'confirm':
				return __( 'Confirm your decision' );
			case 'intro':
			default:
				return __( 'Delete domain' );
		}
	}, [ step ] );

	const onConfirmStep = useCallback( () => {
		switch ( step ) {
			case 'intro':
				setStep( isEmailBasedOnDomain ? 'warning' : 'confirm' );
				break;
			case 'warning':
				setStep( 'confirm' );
				break;
			case 'confirm':
				setStep( 'intro' );
				onConfirm();
				closeDialog();
				break;
		}
	}, [ step, isEmailBasedOnDomain, closeDialog, onConfirm ] );

	const onCancel = useCallback( () => {
		setStep( 'intro' );
		setConfirmInputValue( '' );
		setDomainConfirmed( false );
		closeDialog();
	}, [ closeDialog ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal { ...props } title={ getTitle() } onRequestClose={ onCancel }>
			<VStack spacing={ 4 } style={ { maxWidth: '450px' } }>
				{ step === 'intro' && (
					<>
						<Text as="p">
							{ __(
								'Deleting a domain will make all services connected to it unreachable, including your email and website. It will also make the domain available for someone else to register.'
							) }
						</Text>
						{ domain.is_gravatar_domain && (
							<Text as="p">
								{ __(
									'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
								) }
							</Text>
						) }
						<Text as="p">
							{ createInterpolateElement(
								__(
									'If you want to use <domain /> with another provider you can <transferLink>transfer it</transferLink>.'
								),
								{
									domain: <strong>{ domain.domain }</strong>,
									transferLink: (
										<RouterLinkButton
											variant="link"
											to={ domainTransferRoute.fullPath }
											params={ { domainName: domain.domain } }
										>
											{ __( 'Transfer' ) }
										</RouterLinkButton>
									),
								}
							) }
						</Text>
						<Text as="p">{ __( 'Do you still want to continue with deleting your domain?' ) }</Text>
					</>
				) }
				{ step === 'warning' && (
					<>
						<Text as="p">
							{ __(
								'You are deleting a domain name used in the email address we have on file for you. You must update your contact information.'
							) }
						</Text>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'You must visit your <a>Account Settings</a> to update your email address before proceeding.'
								),
								{
									a: <RouterLinkButton variant="link" to={ profileRoute.fullPath } />,
								}
							) }
						</Text>
					</>
				) }
				{ step === 'confirm' && (
					<>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'<domainName /> will be deleted. Any services related to it will stop working. Are you sure you want to proceed?'
								),
								{
									domainName: <strong>{ domain.domain }</strong>,
								}
							) }
						</Text>
						<div>
							<InputControl
								value={ confirmInputValue }
								__next40pxDefaultSize
								label={ __( 'Type your domain name to proceed' ) }
								onChange={ ( val ) => {
									setConfirmInputValue( val || '' );
									setDomainConfirmed( val === domain.domain );
								} }
							/>
						</div>
					</>
				) }
				<HStack justify="flex-end" spacing={ 2 }>
					<Button variant="tertiary" onClick={ onCancel }>
						{ __( 'Cancel' ) }
					</Button>
					{ step === 'intro' && (
						<Button variant="primary" onClick={ onConfirmStep }>
							{ __( 'Continue' ) }
						</Button>
					) }
					{ step === 'confirm' && (
						<Button
							isDestructive={ domainConfirmed }
							variant="primary"
							disabled={ ! domainConfirmed }
							onClick={ onConfirmStep }
						>
							{ __( 'Delete' ) }
						</Button>
					) }
				</HStack>
			</VStack>
		</Modal>
	);
}
