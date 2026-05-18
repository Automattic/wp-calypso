import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ConfirmationDialog } from '../confirmation-dialog';

interface ReelShareConfirmationDialogProps {
	isOpen: boolean;
	igDisplayName: string | null;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ReelShareConfirmationDialog( {
	isOpen,
	igDisplayName,
	onConfirm,
	onCancel,
}: ReelShareConfirmationDialogProps ): JSX.Element {
	const body = igDisplayName
		? createInterpolateElement(
				__( 'This video will be published to <account /> on Instagram.', __i18n_text_domain__ ),
				{ account: <strong>{ igDisplayName }</strong> }
		  )
		: __(
				'This Reel will be published to your connected Instagram account.',
				__i18n_text_domain__
		  );

	return (
		<ConfirmationDialog
			isOpen={ isOpen }
			title={ __( 'Share to Instagram?', __i18n_text_domain__ ) }
			actions={ [
				{
					text: __( 'Cancel', __i18n_text_domain__ ),
					onClick: onCancel,
					variant: 'tertiary',
				},
				{
					text: __( 'Share', __i18n_text_domain__ ),
					onClick: onConfirm,
					variant: 'primary',
				},
			] }
			onClose={ onCancel }
		>
			{ body }
		</ConfirmationDialog>
	);
}
