import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { PHPLog, ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import type { Action, ActionModal } from '@wordpress/dataviews';

interface Props {
	item: PHPLog | ServerLog;
	onClose: () => void;
	actions: Action< PHPLog | ServerLog >[];
}

export default function DetailsModal( { item, actions, onClose }: Props ) {
	const translate = useTranslate();

	const actionModal = actions.find(
		( action ) => ( action as ActionModal< PHPLog | ServerLog > ).RenderModal
	);

	if ( ! actionModal ) {
		return null;
	}

	const { RenderModal } = actionModal as ActionModal< PHPLog | ServerLog >;

	return (
		<Modal
			title={ translate( 'Log Details' ) } /* Same title as dataviews action modal */
			onRequestClose={ onClose }
			focusOnMount="firstContentElement"
			size="medium" /* Same size as dataviews modal */
		>
			<RenderModal items={ [ item ] } />
		</Modal>
	);
}
