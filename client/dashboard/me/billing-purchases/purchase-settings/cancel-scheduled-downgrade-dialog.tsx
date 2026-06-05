import { userCancelScheduledDowngradeQuery } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import type { Purchase } from '@automattic/api-core';

interface CancelScheduledDowngradeDialogProps {
	purchase: Purchase;
	currentPlanTitle: string;
	isOpen: boolean;
	onClose: () => void;
	onCancelSuccess?: () => void;
}

export function CancelScheduledDowngradeDialog( {
	purchase,
	currentPlanTitle,
	isOpen,
	onClose,
	onCancelSuccess,
}: CancelScheduledDowngradeDialogProps ) {
	const [ error, setError ] = useState< string | null >( null );
	const { mutate: cancelScheduledDowngrade } = useMutation( {
		...userCancelScheduledDowngradeQuery(),
		meta: {
			snackbar: {
				success: __( 'Your scheduled downgrade was canceled.' ),
			},
		},
		onSuccess: () => {
			setError( null );
			onClose();
			onCancelSuccess?.();
		},
		onError: ( err: Error ) => {
			setError( err.message );
		},
	} );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<ConfirmDialog
			__experimentalHideHeader={ false }
			title={ String( __( 'Keep your current plan?' ) ) }
			size="small"
			confirmButtonText={ String( __( 'Keep my plan' ) ) }
			cancelButtonText={ String( __( 'Not now' ) ) }
			isOpen={ isOpen }
			onConfirm={ () => cancelScheduledDowngrade( { purchaseId: purchase.ID } ) }
			onCancel={ onClose }
		>
			<Text>
				{ sprintf(
					/* translators: %(plan)s is the current plan name (e.g. "WordPress.com Business") */
					__( 'Your %(plan)s plan will stay active. You can schedule a downgrade again anytime.' ),
					{ plan: currentPlanTitle }
				) }
			</Text>
			{ error && <Text>{ error }</Text> }
		</ConfirmDialog>
	);
}
