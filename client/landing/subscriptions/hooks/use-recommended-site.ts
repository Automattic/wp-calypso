import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { isSiteInRecommendedBlogsList } from 'calypso/state/reader/lists/selectors';
import type { AppState } from 'calypso/types';

interface UseRecommendedSiteResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

/**
 * Custom hook for managing recommended site state with optimistic updates
 * @param blogId - The blog ID to check/manage recommendation status for
 * @returns Object with recommendation state and toggle function
 */
export const useRecommendedSite = ( blogId: number ): UseRecommendedSiteResult => {
	const dispatch = useDispatch();
	const currentUserName = useSelector( getCurrentUserName );

	// Memoized selector to avoid recreation on every render
	const selectIsInRecommendedList = useCallback(
		( state: AppState ) =>
			currentUserName ? isSiteInRecommendedBlogsList( state, currentUserName, blogId ) : false,
		[ currentUserName, blogId ]
	);

	// Get actual state from Redux
	const isInRecommendedList = useSelector( selectIsInRecommendedList );

	// Local state for optimistic updates and loading state
	const [ optimisticRecommendedState, setOptimisticRecommendedState ] = useState< boolean | null >(
		null
	);
	const [ isUpdating, setIsUpdating ] = useState( false );

	// Use optimistic state if available, otherwise fall back to selector value
	const isRecommended =
		optimisticRecommendedState !== null ? optimisticRecommendedState : isInRecommendedList;

	// Determine if toggle is available
	const canToggle = Boolean( currentUserName && typeof currentUserName === 'string' );

	// Sync optimistic state with selector when selector changes
	useEffect( () => {
		if (
			optimisticRecommendedState !== null &&
			optimisticRecommendedState === isInRecommendedList
		) {
			// Optimistic state matches actual state, clear optimistic state
			setOptimisticRecommendedState( null );
		}
	}, [ isInRecommendedList, optimisticRecommendedState ] );

	// Toggle function with optimistic updates
	const toggleRecommended = useCallback( () => {
		if ( ! canToggle || isUpdating ) {
			return;
		}

		const newValue = ! isRecommended;
		setIsUpdating( true );

		// Set optimistic state for immediate visual feedback
		setOptimisticRecommendedState( newValue );

		try {
			if ( newValue ) {
				dispatch(
					addRecommendedBlogsSite( blogId, currentUserName as string, {
						successMessage: translate( 'Site added to your recommended blogs.' ),
						errorMessage: translate( 'Failed to add site to recommended blogs. Please try again.' ),
					} )
				);
			} else {
				dispatch(
					removeRecommendedBlogsSite( blogId, currentUserName as string, {
						successMessage: translate( 'Site removed from your recommended blogs.' ),
						errorMessage: translate( 'Failed to remove site from recommended blogs.' ),
					} )
				);
			}
		} finally {
			setIsUpdating( false );
		}
	}, [ canToggle, isUpdating, isRecommended, blogId, currentUserName, dispatch ] );

	return {
		isRecommended,
		isUpdating,
		canToggle,
		toggleRecommended,
	};
};
