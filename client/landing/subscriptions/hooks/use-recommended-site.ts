import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import {
	getListByOwnerAndSlug,
	getMatchingItem,
	getLatestListItemError,
} from 'calypso/state/reader/lists/selectors';
import type { ReaderList } from 'calypso/reader/list-manage/types';
import type { AppState } from 'calypso/types';

interface ListItemError {
	type: string;
	listId: number;
	contentId: number;
	contentType: 'feed';
	timestamp: number;
	listOwner: string;
	listSlug: string;
}

interface UseRecommendedSiteResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

/**
 * Custom hook for managing recommended site state with optimistic updates
 * @param feedId - The feed ID to add/remove from recommended blogs list
 * @returns Object with recommendation state and toggle function
 */
export const useRecommendedSite = ( feedId: number ): UseRecommendedSiteResult => {
	const dispatch = useDispatch();
	const currentUserName = useSelector( getCurrentUserName );

	// Get the recommended blogs list for the current user
	const recommendedBlogsList = useSelector( ( state: AppState ) => {
		if ( ! currentUserName ) {
			return null;
		}
		return getListByOwnerAndSlug( state, currentUserName, 'recommended-blogs' ) as ReaderList;
	} );

	// Memoized selector to check if item is in recommended list
	const selectIsInRecommendedList = useCallback(
		( state: AppState ) => {
			if ( ! currentUserName || ! recommendedBlogsList?.ID ) {
				return false;
			}

			// Match by feedId only
			const matchByFeedId = getMatchingItem( state, { listId: recommendedBlogsList.ID, feedId } );
			return !! matchByFeedId;
		},
		[ currentUserName, recommendedBlogsList?.ID, feedId ]
	);

	// Get actual state from Redux
	const isInRecommendedList = useSelector( selectIsInRecommendedList );

	// Check for errors
	const latestError = useSelector( ( state: AppState ) => {
		if ( ! recommendedBlogsList?.ID ) {
			return null;
		}
		const error = getLatestListItemError( state, recommendedBlogsList.ID, feedId, 'feed' );
		return error;
	} ) as ListItemError | null;

	// Local state for optimistic updates and loading state
	const [ optimisticRecommendedState, setOptimisticRecommendedState ] = useState< boolean | null >(
		null
	);
	const [ isUpdating, setIsUpdating ] = useState( false );

	// Track the last operation timestamp to detect when errors correspond to current operations
	const lastOperationTimestamp = useRef< number | null >( null );

	// Track the original state before operation to revert to on error
	const originalStateBeforeOperation = useRef< boolean | null >( null );

	// Use optimistic state if available, otherwise fall back to selector value
	const isRecommended =
		optimisticRecommendedState !== null ? optimisticRecommendedState : isInRecommendedList;

	// Determine if toggle is available
	const canToggle = Boolean(
		currentUserName && typeof currentUserName === 'string' && recommendedBlogsList?.ID
	);

	// Sync optimistic state with selector when selector changes
	useEffect( () => {
		if (
			optimisticRecommendedState !== null &&
			optimisticRecommendedState === isInRecommendedList
		) {
			// Don't clear optimistic state if there's a recent error for this operation
			const hasRecentError =
				latestError &&
				lastOperationTimestamp.current &&
				latestError.timestamp >= lastOperationTimestamp.current;

			// Don't clear optimistic state immediately after an operation
			// Give a small delay to allow errors to be detected first
			const isRecentOperation =
				lastOperationTimestamp.current && Date.now() - lastOperationTimestamp.current < 1000; // 1 second delay

			if ( ! hasRecentError && ! isRecentOperation ) {
				// Optimistic state matches actual state, clear optimistic state
				setOptimisticRecommendedState( null );
			}
		}
	}, [ isInRecommendedList, optimisticRecommendedState, latestError ] );

	// Error recovery: Reset optimistic state if error detected for recent operation
	useEffect( () => {
		if (
			latestError &&
			lastOperationTimestamp.current &&
			latestError.timestamp >= lastOperationTimestamp.current &&
			optimisticRecommendedState !== null
		) {
			// There's a recent error for our operation, reset optimistic state to original state
			setOptimisticRecommendedState( originalStateBeforeOperation.current );
			setIsUpdating( false );
		}
	}, [ latestError, optimisticRecommendedState ] );

	// Toggle function with optimistic updates
	const toggleRecommended = useCallback( () => {
		if ( ! canToggle || isUpdating || ! recommendedBlogsList?.ID ) {
			return;
		}

		const newValue = ! isRecommended;
		lastOperationTimestamp.current = Date.now();

		// Store the original state before the operation for error recovery
		originalStateBeforeOperation.current = isRecommended;

		setIsUpdating( true );

		// Set optimistic state for immediate visual feedback
		setOptimisticRecommendedState( newValue );

		try {
			if ( newValue ) {
				dispatch(
					addRecommendedBlogsSite( recommendedBlogsList.ID, feedId, currentUserName as string, {
						successMessage: translate( 'Site added to your recommended blogs.' ),
						errorMessage: translate( 'Failed to add site to recommended blogs. Please try again.' ),
					} )
				);
			} else {
				dispatch(
					removeRecommendedBlogsSite( recommendedBlogsList.ID, feedId, currentUserName as string, {
						successMessage: translate( 'Site removed from your recommended blogs.' ),
						errorMessage: translate( 'Failed to remove site from recommended blogs.' ),
					} )
				);
			}
		} finally {
			setIsUpdating( false );
		}
	}, [
		canToggle,
		isUpdating,
		isRecommended,
		feedId,
		currentUserName,
		recommendedBlogsList?.ID,
		dispatch,
	] );

	return {
		isRecommended,
		isUpdating,
		canToggle,
		toggleRecommended,
	};
};
