/**
 * External dependencies
 */
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getStoredItem } from 'calypso/lib/browser-storage';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

export function useQuickLinksIsExpanded(): [
	boolean | null,
	( isExpanded: boolean ) => void,
	boolean
] {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const value = useSelector( ( state ) => getPreference( state, 'homeQuickLinksToggleStatus' ) );

	const [ isLoadingDeprecated, setIsLoadingDeprecated ] = useState( true );
	const [ deprecatedValue, setDeprecatedValue ] = useState( null );

	useEffect( () => {
		// The expanded state was previously in a `home` tree in the Redux store.
		// Now that the expanded state is in the `preferences` tree, this helper
		// will migrate any existing state from the persisted Redux store so we
		// can use it as the default.

		if ( value !== null ) {
			// Something already stored in preferences, no need to migrate from Redux store
			setIsLoadingDeprecated( false );
			return;
		}

		if ( ! userId ) {
			// Logged out? Probably shouldn't be seeing the quick-expander. Included for completeness.
			setIsLoadingDeprecated( false );
			return;
		}

		getStoredItem( `redux-state-${ userId }:home` )
			.then( ( result: any ) => {
				setDeprecatedValue( result?.quickLinksToggleStatus || null );
			} )
			.catch( () => {
				setDeprecatedValue( null );
			} )
			.finally( () => {
				setIsLoadingDeprecated( false );
			} );
	}, [ value, setDeprecatedValue, userId ] );

	const setIsExpanded = useCallback(
		( isExpanded: boolean ) =>
			dispatch(
				savePreference( 'homeQuickLinksToggleStatus', isExpanded ? 'expanded' : 'collapsed' )
			),
		[ dispatch ]
	);

	let isExpanded = value !== 'collapsed';
	if ( ! value && deprecatedValue ) {
		isExpanded = deprecatedValue !== 'collapsed';
	}

	return [ isExpanded, setIsExpanded, isLoadingDeprecated ];
}
