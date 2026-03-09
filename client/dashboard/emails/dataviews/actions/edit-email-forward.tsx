import { updateEmailForwardMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	TextControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import emailValidator from 'email-validator';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Text } from '../../../components/text';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

export const useEditEmailForwardAction = (): Action< Email > => {
	return {
		id: 'edit-email-forward',
		label: __( 'Edit forwarder' ),
		callback: () => {},
		RenderModal: ( { items, closeModal, onActionPerformed } ) => {
			const { mutateAsync: updateEmailForward, isPending } = useMutation(
				updateEmailForwardMutation()
			);
			const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
			const { recordTracksEvent } = useAnalytics();

			const email = items[ 0 ];
			const mailbox = email.emailAddress.split( '@' )[ 0 ];
			const currentDestination = email.forwardingTo ?? '';

			const [ newDestination, setNewDestination ] = useState( currentDestination );

			useEffect( () => {
				recordTracksEvent( 'calypso_dashboard_emails_action_click', {
					action_id: 'edit-email-forward',
				} );
			}, [ recordTracksEvent ] );

			const isUnchanged = newDestination.trim() === currentDestination;
			const isValid = emailValidator.validate( newDestination.trim() );

			const onConfirm = async () => {
				recordTracksEvent( 'calypso_dashboard_emails_action_confirm_click', {
					action_id: 'edit-email-forward',
				} );
				try {
					await updateEmailForward( {
						domainName: email.domainName,
						mailbox,
						destination: currentDestination,
						newDestination: newDestination.trim(),
					} );
					createSuccessNotice(
						sprintf(
							/* translators: %s is the new forwarding destination email. */
							__( 'Email forward updated. Please check %s to verify the new address.' ),
							newDestination.trim()
						),
						{ type: 'snackbar' }
					);
					onActionPerformed?.( items );
					closeModal?.();
				} catch ( _e ) {
					createErrorNotice(
						sprintf(
							/* translators: %1$s is the email address. */
							__( 'Failed to update forwarder %1$s. Please try again.' ),
							email.emailAddress
						),
						{ type: 'snackbar' }
					);
				}
			};

			const handleCancel = () => {
				recordTracksEvent( 'calypso_dashboard_emails_action_cancel_click', {
					action_id: 'edit-email-forward',
				} );
				closeModal?.();
			};

			return (
				<VStack spacing={ 4 }>
					<Text>
						{ sprintf(
							/* translators: %s is the email address being edited. */
							__( 'Edit the forwarding destination for %s.' ),
							email.emailAddress
						) }
					</Text>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Forward to' ) }
						value={ newDestination }
						onChange={ setNewDestination }
						type="email"
						disabled={ isPending }
						help={
							! isUnchanged && newDestination.trim() && ! isValid
								? __( 'Please enter a valid email address.' )
								: undefined
						}
					/>
					<HStack justify="right">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ handleCancel }
							disabled={ isPending }
							accessibleWhenDisabled
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ onConfirm }
							isBusy={ isPending }
							disabled={ isPending || isUnchanged || ! isValid }
							accessibleWhenDisabled
						>
							{ __( 'Save' ) }
						</Button>
					</HStack>
				</VStack>
			);
		},
		isEligible: ( item: Email ) => item.type === 'forwarding' && !! item.forwardingTo,
	};
};
