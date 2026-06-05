import { userCancelScheduledDowngradeQuery } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import type { Purchase } from '@automattic/api-core';

interface CancelScheduledDowngradeDialogProps {
	purchase: Purchase;
	currentPlanTitle: string;
	isOpen: boolean;
	onClose: () => void;
}

export function CancelScheduledDowngradeDialog( {
	purchase,
	currentPlanTitle,
	isOpen,
	onClose,
}: CancelScheduledDowngradeDialogProps ) {
	const [ error, setError ] = useState< string | null >( null );
	const { mutate: cancelScheduledDowngrade, isPending } = useMutation( {
		...userCancelScheduledDowngradeQuery(),
		meta: {
			snackbar: {
				success: __( 'Your scheduled downgrade was canceled.' ),
			},
		},
		onSuccess: () => {
			setError( null );
			onClose();
		},
		onError: ( err: Error ) => {
			setError( err.message );
		},
	} );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ String( __( 'Cancel scheduled downgrade?' ) ) }
			onRequestClose={ onClose }
			size="small"
		>
			<VStack spacing={ 4 }>
				<Text>
					{ sprintf(
						/* translators: %(plan)s is the name of the current plan */
						__(
							'Your plan will keep renewing as %(plan)s. You can schedule a downgrade again anytime.'
						),
						{ plan: currentPlanTitle }
					) }
				</Text>
				{ error && <Text className="cancel-scheduled-downgrade-dialog__error">{ error }</Text> }
				<ButtonStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						variant="primary"
						isDestructive
						isBusy={ isPending }
						disabled={ isPending }
						onClick={ () => cancelScheduledDowngrade( { purchaseId: purchase.ID } ) }
					>
						{ __( 'Cancel downgrade' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ onClose }
						disabled={ isPending }
					>
						{ __( 'Keep schedule' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
