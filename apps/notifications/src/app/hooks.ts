import { useNavigator } from '@wordpress/components';
import { useRef } from 'react';
import { getFilters } from '../panel/templates/filters';

export type FilterName = keyof ReturnType< typeof getFilters >;

/**
 * Notifications routing state, parsed from the Navigator path.
 *
 * Parsed from the path (rather than `useNavigator().params`) to accommodate
 * components that live outside any `Navigator.Screen`.
 *
 * - `filterName`: the active filter tab.
 * - `selectedNoteId`: the currently selected note, or `undefined` when no note
 *   detail pane is open.
 * - `activeNoteId`: like `selectedNoteId`, but sticks to the last note while the
 *   note detail pane is being animated out (even when the path no longer matches).
 * - `goTo`: navigate to a new path (re-exposed from `useNavigator()`).
 */
export function useNotificationsRoute() {
	const { location, goTo } = useNavigator();
	const [ , pathFilter, section, pathNoteId ] = location.path?.split( '/' ) ?? [];

	const filterName: FilterName =
		pathFilter && pathFilter in getFilters() ? ( pathFilter as FilterName ) : 'all';
	const selectedNoteId = section === 'notes' ? pathNoteId : undefined;
	const activeNoteId = useLastDefined( selectedNoteId );

	return { filterName, selectedNoteId, activeNoteId, goTo };
}

/**
 * Returns `value`, or the last non-nullish value seen if `value` is currently
 * nullish.
 */
function useLastDefined< T >( value: T | undefined ): T | undefined {
	const ref = useRef< T | undefined >( value );
	if ( value != null ) {
		ref.current = value;
	}
	return ref.current;
}
