import { __ } from '@wordpress/i18n';
import ConfirmModal from '../../../../components/confirm-modal';

interface Props {
	onCancel: () => void;
	onConfirm: () => void;
	isBusy: boolean;
	isOpen: boolean;
}

export const ApplySettingsToAllSitesConfirmationModal = ( props: Props ) => {
	const { onCancel, onConfirm, isBusy, isOpen } = props;
	return (
		<ConfirmModal
			title={ __( 'Apply to all sites?' ) }
			onCancel={ onCancel }
			onConfirm={ onConfirm }
			isOpen={ isOpen }
			confirmButtonProps={ { label: __( 'Yes, apply to all sites' ), isBusy } }
			cancelButtonText={ __( 'Cancel' ) }
			__experimentalHideHeader={ false }
		>
			{ __( 'The selected settings will be applied to all your sites at once.' ) }
		</ConfirmModal>
	);
};
