import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { Action, ActionModal } from '@wordpress/dataviews';

/**
 * Opens one of a screen's DataViews actions from the URL.
 *
 * Pass the action id from the route's own search params — validated there, so a
 * screen only accepts the actions it means to expose — along with the actions and
 * items it renders. The result spreads straight into `DataViewsActionModal`:
 *
 *     const deepLinkedAction = useDeepLinkedAction( {
 *         actionId: searchParams.action,
 *         actions,
 *         items,
 *     } );
 *
 *     { deepLinkedAction && <DataViewsActionModal { ...deepLinkedAction } /> }
 *
 * The action opens against the first item it is eligible for, which suits an
 * action that identifies its own row. The param is dropped from the URL on arrival
 * so a reload or a shared link doesn't reopen the modal.
 *
 * @param options              Options.
 * @param options.actionId     The action to open, from the route's search params.
 * @param options.actions      The actions the screen renders.
 * @param options.items        The items the screen renders.
 * @param options.paramName    The search param holding the action id.
 * @returns The action, the item it opens against, and a close handler — or
 * `undefined` when there is nothing to open.
 */
export function useDeepLinkedAction< Item >( {
	actionId,
	actions,
	items,
	paramName = 'action',
}: {
	actionId?: string;
	actions: Action< Item >[];
	items: Item[];
	paramName?: string;
} ): { action: ActionModal< Item >; item: Item; onClose: () => void } | undefined {
	const navigate = useNavigate();

	// Read once, so the modal survives the param being cleared below.
	const [ requestedActionId ] = useState( () => actionId );
	const [ isOpen, setIsOpen ] = useState( () => !! actionId );

	useEffect( () => {
		if ( ! actionId ) {
			return;
		}

		// The router types a search updater against the route it is called from, which
		// a hook shared by every screen has no way to name.
		navigate( {
			search: ( previous: Record< string, unknown > ) => ( {
				...previous,
				[ paramName ]: undefined,
			} ),
			replace: true,
		} as unknown as Parameters< typeof navigate >[ 0 ] );
	}, [ actionId, navigate, paramName ] );

	const matchedAction = actions.find( ( action ) => action.id === requestedActionId );
	const action = matchedAction && 'RenderModal' in matchedAction ? matchedAction : undefined;
	const item = action && items.find( ( candidate ) => action.isEligible?.( candidate ) ?? true );

	if ( ! isOpen || ! action || ! item ) {
		return undefined;
	}

	return { action, item, onClose: () => setIsOpen( false ) };
}
