import { deleteEmailForwardMutation } from '@automattic/api-queries';
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

export const useDeleteEmailForwardAction = (): Action< Email > => {
	return {
		id: 'delete-email-forward',
		label: __( 'Delete forwarder' ),
		isDestructive: true,
		callback: () => {},
		RenderModal: ( { items, closeModal, onActionPerformed } ) => {
			const { mutateAsync: deleteEmailForward, isPending } = useMutation(
				deleteEmailForwardMutation()
			);
			const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
			const email = items[ 0 ];

			const mailbox = email.emailAddress.split( '@' )[ 0 ];
			const onConfirm = async () => {
				try {
					await deleteEmailForward( {
						domainName: email.domainName,
						mailbox,
						destination: email.forwardingTo as string,
					} );
					createSuccessNotice(
						sprintf(
							/* translators: %1$s is the email and %2$s is the forwarding destination address. */
							__( 'Forwarder from %1$s to %2$s has been removed.' ),
							email.emailAddress,
							email.forwardingTo as string
						),
						{ type: 'snackbar' }
					);
					onActionPerformed?.( items );
					closeModal?.();
				} catch ( _e ) {
					createErrorNotice(
						sprintf(
							/* translators: %1$s is the email and %2$s is the forwarding destination address. */
							__( 'Failed to remove forwarder from %1$s to %2$s. Please try again.' ),
							email.emailAddress,
							email.forwardingTo as string
						),
						{ type: 'snackbar' }
					);
				}
			};
			return (
				<VStack spacing={ 4 }>
					<Text>
						{ sprintf(
							/* translators: %1$s is the email and %2$s is the forwarding destination address. */
							__( 'Emails sent to %1$s address will no longer be forwarded to %2$s.' ),
							email.emailAddress,
							email.forwardingTo
						) }
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
							accessibleWhenDisabled
							isDestructive
						>
							{ __( 'Remove' ) }
						</Button>
					</HStack>
				</VStack>
			);
		},
		isEligible: ( item: Email ) => item.type === 'forwarding' && !! ( item?.forwardingTo ?? false ),
	};
};
