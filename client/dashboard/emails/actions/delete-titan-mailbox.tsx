import { deleteTitanMailboxMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Text } from '../../components/text';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const useDeleteTitanMailboxAction = (): Action< Email > => {
	return {
		id: 'delete-titan-mailbox',
		label: __( 'Delete mailbox' ),
		isDestructive: true,
		// Using a modal to confirm deletion
		callback: () => {},
		RenderModal: ( { items, closeModal, onActionPerformed } ) => {
			const { mutateAsync: deleteTitanMailbox, isPending } = useMutation(
				deleteTitanMailboxMutation()
			);
			const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
			const email = items[ 0 ];

			const mailbox = email.emailAddress.split( '@' )[ 0 ];
			const onConfirm = async () => {
				try {
					await deleteTitanMailbox( { domainName: email.domainName, mailbox: mailbox } );
					createSuccessNotice(
						sprintf(
							/* translators: %s is the email address. */
							__( 'Mailbox %s has been scheduled for removal.' ),
							email.emailAddress
						),
						{ type: 'snackbar' }
					);
					onActionPerformed?.( items );
					closeModal?.();
				} catch ( _e ) {
					createErrorNotice(
						sprintf(
							/* translators: %s is the email address. */
							__( 'Failed to remove mailbox %s. Please try again.' ),
							email.emailAddress
						),
						{ type: 'snackbar' }
					);
				}
			};
			return (
				<VStack spacing={ 4 }>
					<Text>
						{ sprintf(
							/* translators: %s is the email address to remove. */
							__( 'Are you sure you want to remove %s?' ),
							email.emailAddress
						) }
					</Text>
					<Text>
						{ __( 'All your emails, calendar events, and contacts will be permanently deleted.' ) }
					</Text>
					<HStack justify="right">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ () => closeModal?.() }
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
							disabled={ isPending }
							isDestructive
							accessibleWhenDisabled
						>
							{ __( 'Remove' ) }
						</Button>
					</HStack>
				</VStack>
			);
		},
		isEligible: ( item: Email ) => item.type === 'mailbox' && item.provider === 'titan',
	};
};
