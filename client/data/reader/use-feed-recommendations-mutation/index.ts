import { translate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite as addFeedRecommendation,
	removeRecommendedBlogsSite as removeFeedRecommendation,
} from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug, getMatchingItem } from 'calypso/state/reader/lists/selectors';
import type { ReaderList } from 'calypso/reader/list-manage/types';
import type { AppState } from 'calypso/types';

interface useFeedRecommendationsMutationResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

/**
 * Custom hook for managing the feed recommendations state with optimistic updates
 * @param feedId - The feed ID to add/remove from recommended feeds list
 * @returns Object with recommendation state and toggle function
 */
export const useFeedRecommendationsMutation = (
	feedId: number
): useFeedRecommendationsMutationResult => {
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

	// Get actual state from Redux (includes optimistic updates handled by reducer)
	const isRecommended = useSelector( selectIsInRecommendedList );

	// Local state for loading state only
	const [ isUpdating, setIsUpdating ] = useState( false );

	// Determine if toggle is available
	const canToggle = Boolean(
		currentUserName && typeof currentUserName === 'string' && recommendedBlogsList?.ID
	);

	// Toggle function - Redux reducer handles optimistic updates
	const toggleRecommended = useCallback( () => {
		if ( ! canToggle || isUpdating || ! recommendedBlogsList?.ID ) {
			return;
		}

		const newValue = ! isRecommended;

		setIsUpdating( true );

		// Add a small delay before allowing the next toggle to prevent rapid toggling
		setTimeout( () => setIsUpdating( false ), 300 );

		if ( newValue ) {
			dispatch(
				addFeedRecommendation( recommendedBlogsList.ID, feedId, currentUserName as string, {
					successMessage: translate( 'Site added to your recommended blogs.' ),
					errorMessage: translate( 'Failed to add site to recommended blogs. Please try again.' ),
				} )
			);
		} else {
			dispatch(
				removeFeedRecommendation( recommendedBlogsList.ID, feedId, currentUserName as string, {
					successMessage: translate( 'Site removed from your recommended blogs.' ),
					errorMessage: translate( 'Failed to remove site from recommended blogs.' ),
				} )
			);
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
