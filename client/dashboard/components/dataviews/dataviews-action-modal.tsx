import { Modal } from '@wordpress/components';
import type { Action, ActionModal } from '@wordpress/dataviews';

/**
 * Renders a DataViews action's modal outside the row menu, with the chrome
 * DataViews would have given it.
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

/**
 * Opens one of a screen's DataViews actions from the URL, against the first item
 * the action is eligible for. The param is what holds the modal open, and closing
 * is what drops it, so a reload — or a trip through re-auth — resumes where the
 * user left off.
 */
export function useDeepLinkedDataViewsAction< Item >( {
	queryParams,
	navigate,
	actions,
	items,
	paramName = 'action',
}: {
	queryParams?: Record< string, unknown >;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- hosts type their own search, as `useBasePersistentView` also finds.
	navigate: ( options: { search: any; replace?: boolean } ) => void;
	actions: Action< Item >[];
	items: Item[];
	paramName?: string;
} ): { action: ActionModal< Item >; item: Item; onClose: () => void } | undefined {
	const actionId = queryParams?.[ paramName ];

	if ( ! actionId ) {
		return undefined;
	}

	const matchedAction = actions.find( ( action ) => action.id === actionId );
	const action = matchedAction && 'RenderModal' in matchedAction ? matchedAction : undefined;
	const item = action && items.find( ( candidate ) => action.isEligible?.( candidate ) ?? true );

	if ( ! action || ! item ) {
		return undefined;
	}

	return {
		action,
		item,
		onClose: () =>
			navigate( { search: { ...queryParams, [ paramName ]: undefined }, replace: true } ),
	};
}
