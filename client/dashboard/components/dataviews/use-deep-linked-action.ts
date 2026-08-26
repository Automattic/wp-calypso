import { useEffect, useState } from 'react';
import type { Action, ActionModal } from '@wordpress/dataviews';

/**
 * Opens one of a screen's DataViews actions from the URL.
 *
 * Pass the query params of the current page — the action id is read from `action`,
 * which a route should validate down to the actions it means to expose — along
 * with the actions and items the screen renders. The result spreads straight into
 * `DataViewsActionModal`:
 *
 *     const deepLinkedAction = useDeepLinkedAction( {
 *         queryParams,
 *         navigate,
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
 * @param options             Options.
 * @param options.queryParams The query params of the current page.
 * @param options.navigate    Navigates to a new set of query params. Router-hosted
 *                            screens pass `useNavigate()`; `page.js` screens pass a
 *                            function of their own, as `useBasePersistentView`
 *                            callers do.
 * @param options.actions     The actions the screen renders.
 * @param options.items       The items the screen renders.
 * @param options.paramName   The query param holding the action id.
 * @returns The action, the item it opens against, and a close handler — or
 * `undefined` when there is nothing to open.
 */
export function useDeepLinkedAction< Item >( {
	queryParams,
	navigate,
	actions,
	items,
	paramName = 'action',
}: {
	queryParams?: Record< string, unknown >;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the two hosts type their own search differently, as `useBasePersistentView` also finds.
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
		// `queryParams` is a new object every render, so keying on the param itself is
		// what keeps this to the single navigation that clears it.
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
