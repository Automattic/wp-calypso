import { Modal } from '@wordpress/components';
import { ComponentProps } from 'react';
import ActionRenderModal, {
	ActionRenderModalProps,
} from '../../manage/components/action-render-modal';

type ActionRenderModalWrapperProps = ActionRenderModalProps &
	Pick< ComponentProps< typeof Modal >, 'onRequestClose' | 'title' >;

export const ActionRenderModalWrapper = ( {
	actionId,
	closeModal,
	items,
	onActionPerformed,
	onExecute,
	onRequestClose,
	title,
}: ActionRenderModalWrapperProps ) => {
	return (
		<Modal title={ title } onRequestClose={ onRequestClose }>
			<ActionRenderModal
				actionId={ actionId }
				items={ items }
				closeModal={ closeModal }
				onExecute={ onExecute }
				onActionPerformed={ onActionPerformed }
			/>
		</Modal>
	);
};
