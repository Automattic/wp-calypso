import {
	addReadListFeedMutation,
	deleteReadListFeedMutation,
	readListItemsAllQuery,
	readSubscribedListsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

interface useFeedRecommendationsMutationResult {
	isRecommended: boolean;
	isUpdating: boolean;
	canToggle: boolean;
	toggleRecommended: () => void;
}

const RECOMMENDED_BLOGS_SLUG = 'recommended-blogs';

/**
 * Custom hook for managing the feed recommendations state with optimistic updates
 * @param feedId - The feed ID to add/remove from recommended feeds list
 * @returns Object with recommendation state and toggle function
 */
export const useFeedRecommendationsMutation = (
	feedId: number
): useFeedRecommendationsMutationResult => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const currentUserName = useSelector( getCurrentUserName );

	const { data: subscribedListsData } = useQuery( {
		...readSubscribedListsQuery(),
		enabled: !! currentUserName,
	} );
	const recommendedBlogsList = currentUserName
		? subscribedListsData?.lists.find(
				( list ) => list.owner === currentUserName && list.slug === RECOMMENDED_BLOGS_SLUG
		  )
		: undefined;

	const { data: itemsData } = useQuery( {
		...readListItemsAllQuery( currentUserName, RECOMMENDED_BLOGS_SLUG ),
		enabled: !! currentUserName && !! recommendedBlogsList?.ID,
	} );
	const isRecommended = !! itemsData?.items?.some(
		( item ) => Number( item.feed_ID ) === Number( feedId )
	);

	const { mutate: addFeed, isPending: isAdding } = useMutation(
		addReadListFeedMutation( queryClient )
	);
	const { mutate: deleteFeed, isPending: isDeleting } = useMutation(
		deleteReadListFeedMutation( queryClient )
	);
	const isUpdating = isAdding || isDeleting;

	const canToggle = Boolean(
		currentUserName && typeof currentUserName === 'string' && recommendedBlogsList?.ID
	);

	const toggleRecommended = useCallback( () => {
		if ( ! canToggle || isUpdating || ! recommendedBlogsList?.ID || ! currentUserName ) {
			return;
		}

		const newValue = ! isRecommended;
		const variables = {
			owner: currentUserName as string,
			slug: RECOMMENDED_BLOGS_SLUG,
			feedId,
		};

		if ( newValue ) {
			addFeed( variables, {
				onSuccess: () => {
					dispatch( successNotice( translate( 'Site added to your recommended blogs.' ) ) );
				},
				onError: () => {
					dispatch(
						errorNotice( translate( 'Failed to add site to recommended blogs. Please try again.' ) )
					);
				},
			} );
		} else {
			deleteFeed( variables, {
				onSuccess: () => {
					dispatch( successNotice( translate( 'Site removed from your recommended blogs.' ) ) );
				},
				onError: () => {
					dispatch( errorNotice( translate( 'Failed to remove site from recommended blogs.' ) ) );
				},
			} );
		}
	}, [
		canToggle,
		isUpdating,
		isRecommended,
		feedId,
		currentUserName,
		recommendedBlogsList?.ID,
		addFeed,
		deleteFeed,
		dispatch,
	] );

	return {
		isRecommended,
		isUpdating,
		canToggle,
		toggleRecommended,
	};
};
