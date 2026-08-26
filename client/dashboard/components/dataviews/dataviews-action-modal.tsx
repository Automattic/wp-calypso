import { Modal } from '@wordpress/components';
import type { ActionModal } from '@wordpress/dataviews';

/**
 * Renders a DataViews action's modal outside the row menu, with the chrome
 * DataViews would have given it.
 *
 * Use it where something other than a click has to open an action — a deep link,
 * say — so that route and menu open the very same modal.
 */
export function DataViewsActionModal< Item >( {
	action,
	item,
	onClose,
}: {
	action: ActionModal< Item >;
	item: Item;
	onClose: () => void;
} ) {
	const label = typeof action.label === 'function' ? action.label( [ item ] ) : action.label;
	const modalHeader =
		typeof action.modalHeader === 'function' ? action.modalHeader( [ item ] ) : action.modalHeader;

	return (
		<Modal
			title={ modalHeader || label }
			size={ action.modalSize ?? 'medium' }
			onRequestClose={ onClose }
		>
			<action.RenderModal items={ [ item ] } closeModal={ onClose } />
		</Modal>
	);
}
