import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundConfirmModal } from '../playground-confirm-modal';

interface PlaygroundLeaveModalProps {
	onConfirm: () => void;
	onCancel: () => void;
	isConfirming?: boolean;
}

export function PlaygroundLeaveModal( {
	onConfirm,
	onCancel,
	isConfirming,
}: PlaygroundLeaveModalProps ) {
	const { __ } = useI18n();

	return (
		<PlaygroundConfirmModal
			className="playground-leave-modal"
			title={ __( 'Leave without saving' ) }
			description={ __(
				'All the store information you’ve entered will be lost if you leave now.'
			) }
			confirmLabel={ __( 'Continue without saving' ) }
			cancelLabel={ __( 'Keep building' ) }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			isConfirming={ isConfirming }
		/>
	);
}
