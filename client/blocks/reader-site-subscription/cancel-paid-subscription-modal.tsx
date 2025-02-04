import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/components/confirm-modal';

type CancelPaidSubscriptionModalProps = {
	isVisible: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

const CancelPaidSubscriptionModal = ( {
	isVisible,
	onCancel,
	onConfirm,
}: CancelPaidSubscriptionModalProps ) => {
	const translate = useTranslate();

	return (
		<ConfirmModal
			isVisible={ isVisible }
			confirmButtonLabel={ translate( 'Manage purchases' ) }
			text={ translate(
				'Looks like you’re trying to cancel a paid subscription. To do so, you’ll need to cancel the subscription plan first.'
			) }
			title={ translate( 'Cancel paid subscription' ) }
			onCancel={ onCancel }
			onConfirm={ onConfirm }
		/>
	);
};

export default CancelPaidSubscriptionModal;
