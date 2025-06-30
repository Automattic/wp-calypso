import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsFeed,
	removeRecommendedBlogsFeed,
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug, getMatchingItem } from 'calypso/state/reader/lists/selectors';
import type { ReaderList } from 'calypso/reader/list-manage/types';
import type { AppState } from 'calypso/types';

interface UseRecommendedContentResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

interface UseRecommendedContentOptions {
	/**
	 * The type of content to recommend - either 'feed' or 'site'
	 */
	contentType: 'feed' | 'site';
	/**
	 * The ID of the content (feedId for feeds, siteId for sites)
	 */
	contentId: number;
	/**
	 * Optional: For backward compatibility, when contentType is 'feed',
	 * fallback to checking by siteId if the feed isn't found
	 */
	fallbackSiteId?: number;
}

/**
 * Custom hook for managing recommended content state with optimistic updates
 * Supports both feeds and sites in the recommended blogs list
 * @param options - Configuration object with contentType, contentId, and optional fallbackSiteId
 * @returns Object with recommendation state and toggle function
 */
export const useRecommendedContent = (
	options: UseRecommendedContentOptions
): UseRecommendedContentResult => {
	const dispatch = useDispatch();
	const currentUserName = useSelector( getCurrentUserName );
	const { contentType, contentId, fallbackSiteId } = options;

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

			// Check for the primary content type
			if ( contentType === 'feed' ) {
				const matchByFeedId = getMatchingItem( state, {
					listId: recommendedBlogsList.ID,
					feedId: contentId,
				} );
				if ( matchByFeedId ) {
					return true;
				}

				// Fall back to matching by siteId for backward compatibility
				if ( fallbackSiteId ) {
					const matchBySiteId = getMatchingItem( state, {
						listId: recommendedBlogsList.ID,
						siteId: fallbackSiteId,
					} );
					return !! matchBySiteId;
				}
			} else if ( contentType === 'site' ) {
				const matchBySiteId = getMatchingItem( state, {
					listId: recommendedBlogsList.ID,
					siteId: contentId,
				} );
				return !! matchBySiteId;
			}

			return false;
		},
		[ currentUserName, recommendedBlogsList?.ID, contentType, contentId, fallbackSiteId ]
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
	const canToggle = Boolean(
		currentUserName && typeof currentUserName === 'string' && recommendedBlogsList?.ID
	);

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
		if ( ! canToggle || isUpdating || ! recommendedBlogsList?.ID ) {
			return;
		}

		const newValue = ! isRecommended;
		setIsUpdating( true );

		// Set optimistic state for immediate visual feedback
		setOptimisticRecommendedState( newValue );

		try {
			if ( contentType === 'feed' ) {
				if ( newValue ) {
					dispatch(
						addRecommendedBlogsFeed(
							recommendedBlogsList.ID,
							contentId,
							currentUserName as string,
							{
								successMessage: translate( 'Feed added to your recommended blogs.' ),
								errorMessage: translate(
									'Failed to add feed to recommended blogs. Please try again.'
								),
							}
						)
					);
				} else {
					dispatch(
						removeRecommendedBlogsFeed(
							recommendedBlogsList.ID,
							contentId,
							currentUserName as string,
							{
								successMessage: translate( 'Feed removed from your recommended blogs.' ),
								errorMessage: translate( 'Failed to remove feed from recommended blogs.' ),
							}
						)
					);
				}
			} else if ( contentType === 'site' ) {
				if ( newValue ) {
					dispatch(
						addRecommendedBlogsSite(
							recommendedBlogsList.ID,
							contentId,
							currentUserName as string,
							{
								successMessage: translate( 'Site added to your recommended blogs.' ),
								errorMessage: translate(
									'Failed to add site to recommended blogs. Please try again.'
								),
							}
						)
					);
				} else {
					dispatch(
						removeRecommendedBlogsSite(
							recommendedBlogsList.ID,
							contentId,
							currentUserName as string,
							{
								successMessage: translate( 'Site removed from your recommended blogs.' ),
								errorMessage: translate( 'Failed to remove site from recommended blogs.' ),
							}
						)
					);
				}
			}
		} finally {
			setIsUpdating( false );
		}
	}, [
		canToggle,
		isUpdating,
		isRecommended,
		contentType,
		contentId,
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
