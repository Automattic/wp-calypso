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
import RouterLinkButton from '../../components/router-link-button';
import { Domain } from '../../data/domain';
import type { User } from '../../data/types';

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
	const [ step, setStep ] = useState( 1 );
	const [ confirmInputValue, setConfirmInputValue ] = useState( '' );
	const [ domainConfirmed, setDomainConfirmed ] = useState( false );
	const isEmailBasedOnDomain = user.email.endsWith( domain.domain );

	const getTitle = useCallback( () => {
		switch ( step ) {
			case 1:
				return __( 'Delete domain' );
			case 2:
				return __( 'Update your WordPress.com email address' );
			case 3:
				return __( 'Confirm your decision' );
			default:
				return __( 'Delete domain' );
		}
	}, [ step ] );

	const onConfirmStep = useCallback( () => {
		switch ( step ) {
			case 1:
				setStep( isEmailBasedOnDomain ? 2 : 3 );
				break;
			case 2:
				setStep( 3 );
				break;
			case 3:
				setStep( 1 );
				onConfirm();
				closeDialog();
				break;
		}
	}, [ step, isEmailBasedOnDomain, closeDialog, onConfirm ] );

	const onCancel = useCallback( () => {
		setStep( 1 );
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
				{ step === 1 && (
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
											to="/domains/$domainName/transfer"
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
				{ step === 2 && (
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
									a: <a href="/me/account" />,
								}
							) }
						</Text>
					</>
				) }
				{ step === 3 && (
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
					{ step === 1 && (
						<Button variant="primary" onClick={ onConfirmStep }>
							{ __( 'Continue' ) }
						</Button>
					) }
					{ step === 3 && (
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
