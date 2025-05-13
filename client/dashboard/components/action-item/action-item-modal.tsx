import { Modal } from '@wordpress/components';
import type { ActionItemModalProps } from './types';

export function ActionItemModal( { action, closeModal }: ActionItemModalProps ) {
	return (
		<Modal
			title={ action.modalHeader || action.label }
			__experimentalHideHeader={ !! action.hideModalHeader }
			onRequestClose={ closeModal }
			focusOnMount={ action.modalFocusOnMount ?? true }
			size={ action.modalSize || 'medium' }
			overlayClassName="action-item-modal"
		>
			<action.RenderModal closeModal={ closeModal } />
		</Modal>
	);
}
