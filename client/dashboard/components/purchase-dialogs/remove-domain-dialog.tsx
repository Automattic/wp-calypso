import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { domainTransferRoute } from '../../app/router/domains';
import RouterLinkButton from '../../components/router-link-button';
import { Domain } from '../../data/domain';

const textHeadingProps = {
	as: 'h2' as const,
	size: '20',
	weight: 500,
} as const;

interface RemoveDomainDialogProps {
	domain: Domain;
	closeDialog: () => void;
	removeDomain: () => void;
}

type ConfirmDialogProps = Omit<
	React.ComponentProps< typeof ConfirmDialog >,
	'children' | 'onConfirm'
>;
type Props = RemoveDomainDialogProps & ConfirmDialogProps;

export default function RemoveDomainDialog( { domain, closeDialog, ...props }: Props ) {
	const [ step, setStep ] = useState( 1 );

	const onConfirm = useCallback( () => {
		setStep( step + 1 );
	}, [ step ] );

	const onCancel = useCallback( () => {
		setStep( 1 );
		closeDialog();
	}, [ closeDialog ] );

	return (
		<ConfirmDialog
			{ ...props }
			confirmButtonText={ step === 3 ? __( 'Delete' ) : __( 'Continue' ) }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			isDismissible={ false }
		>
			<VStack spacing={ 4 } style={ { maxWidth: '450px' } }>
				{ step === 1 && (
					<>
						<Text { ...textHeadingProps }>{ __( 'Delete domain' ) }</Text>
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
				{ step === 2 && (
					<>
						<Text { ...textHeadingProps }>{ __( 'Update your WordPress.com email address' ) }</Text>
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
						<Text { ...textHeadingProps }>{ __( 'Confirm your decision' ) }</Text>
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
								__next40pxDefaultSize
								label={ __( 'Type your domain name to proceed' ) }
								onChange={ () => {} }
							/>
						</div>
					</>
				) }
			</VStack>
		</ConfirmDialog>
	);
}
