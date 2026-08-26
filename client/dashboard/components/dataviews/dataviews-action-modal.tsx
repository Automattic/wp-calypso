import { Modal } from '@wordpress/components';
import { useEffect, useState } from 'react';
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
 * the action is eligible for, then drops the param so a reload doesn't reopen it.
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

	// Read once, so the modal survives the param being cleared below.
	const [ requestedActionId ] = useState( () => actionId );
	const [ isOpen, setIsOpen ] = useState( () => !! actionId );

	useEffect( () => {
		if ( ! actionId ) {
			return;
		}

		navigate( { search: { ...queryParams, [ paramName ]: undefined }, replace: true } );
		// `queryParams` is a new object every render; the param is what to key on.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ actionId, paramName ] );

	const matchedAction = actions.find( ( action ) => action.id === requestedActionId );
	const action = matchedAction && 'RenderModal' in matchedAction ? matchedAction : undefined;
	const item = action && items.find( ( candidate ) => action.isEligible?.( candidate ) ?? true );

	if ( ! isOpen || ! action || ! item ) {
		return undefined;
	}

	return { action, item, onClose: () => setIsOpen( false ) };
}
