import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug, getMatchingItem } from 'calypso/state/reader/lists/selectors';
import type { ReaderList } from 'calypso/reader/list-manage/types';
import type { AppState } from 'calypso/types';

interface UseRecommendedSiteResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

interface UseRecommendedSiteOptions {
	feedId?: number;
}

/**
 * Custom hook for managing recommended site state with optimistic updates
 * @param blogId - The blog ID to check/manage recommendation status for
 * @param options - Optional configuration including feedId
 * @returns Object with recommendation state and toggle function
 */
export const useRecommendedSite = (
	blogId: number,
	options?: UseRecommendedSiteOptions
): UseRecommendedSiteResult => {
	const dispatch = useDispatch();
	const currentUserName = useSelector( getCurrentUserName );
	const { feedId } = options || {};

	// Memoized selector to check if item is in recommended list
	// Try matching by feedId first (since that's what we add to the list now), fall back to siteId
	const selectIsInRecommendedList = useCallback(
		( state: AppState ) => {
			if ( ! currentUserName ) {
				return false;
			}

			const list = getListByOwnerAndSlug(
				state,
				currentUserName,
				'recommended-blogs'
			) as ReaderList;
			if ( ! list || ! list.ID ) {
				return false;
			}

			// Try to match by feedId first (preferred, since that's what we add to the list)
			if ( feedId ) {
				const matchByFeedId = getMatchingItem( state, { listId: list.ID, feedId } );
				if ( matchByFeedId ) {
					return true;
				}
			}

			// Fall back to matching by siteId for backward compatibility
			const matchBySiteId = getMatchingItem( state, { listId: list.ID, siteId: blogId } );
			return !! matchBySiteId;
		},
		[ currentUserName, blogId, feedId ]
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
		if ( ! canToggle || isUpdating || ! feedId ) {
			return;
		}

		const newValue = ! isRecommended;
		setIsUpdating( true );

		// Set optimistic state for immediate visual feedback
		setOptimisticRecommendedState( newValue );

		try {
			if ( newValue ) {
				dispatch(
					addRecommendedBlogsSite( feedId, currentUserName as string, {
						successMessage: translate( 'Site added to your recommended blogs.' ),
						errorMessage: translate( 'Failed to add site to recommended blogs. Please try again.' ),
					} )
				);
			} else {
				dispatch(
					removeRecommendedBlogsSite( feedId, currentUserName as string, {
						successMessage: translate( 'Site removed from your recommended blogs.' ),
						errorMessage: translate( 'Failed to remove site from recommended blogs.' ),
					} )
				);
			}
		} finally {
			setIsUpdating( false );
		}
	}, [ canToggle, isUpdating, isRecommended, feedId, currentUserName, dispatch ] );

	return {
		isRecommended,
		isUpdating,
		canToggle,
		toggleRecommended,
	};
};
