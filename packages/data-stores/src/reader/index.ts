import { SiteSubscriptionsQueryPropsProvider, useSiteSubscriptionsQueryProps } from './contexts';
import { useCacheKey, useIsLoggedIn, useSubscriberEmailAddress } from './hooks';
import {
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteEmailMeNewCommentsMutation,
	useSiteEmailMeNewPostsMutation,
	useSiteNotifyMeOfNewPostsMutation,
	useSiteSubscribeMutation,
	useSiteUnsubscribeMutation,
	useUserSettingsMutation,
} from './mutations';
import {
	siteSubscriptionsQueryKeyPrefix,
	usePendingPostSubscriptionsQuery,
	usePendingSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSiteSubscriptionDetailsQuery,
	useSiteSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
} from './queries';

export const SubscriptionManager = {
	SiteSubscriptionsQueryPropsProvider,
	siteSubscriptionsQueryKeyPrefix,
	useCacheKey,
	useIsLoggedIn,
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	usePendingPostSubscriptionsQuery,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePendingSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteEmailMeNewCommentsMutation,
	useSiteEmailMeNewPostsMutation,
	useSiteNotifyMeOfNewPostsMutation,
	useSiteSubscribeMutation,
	useSiteSubscriptionDetailsQuery,
	useSiteSubscriptionsQuery,
	useSiteSubscriptionsQueryProps,
	useSiteUnsubscribeMutation,
	useSubscriberEmailAddress,
	useSubscriptionsCountQuery,
	useUserSettingsMutation,
	useUserSettingsQuery,
};

export { useIsLoggedIn };
export {
	EmailDeliveryFrequency,
	PostSubscriptionsSortBy,
	SiteSubscriptionsFilterBy,
	SiteSubscriptionsSortBy,
} from './constants';
export { callApi, isErrorResponse, isSiteSubscriptionDetails, isValidId } from './helpers';
export { UnsubscribedFeedsSearchProvider, useUnsubscribedFeedsSearch } from './contexts';
export { useReadFeedSearchQuery, useReadFeedSiteQuery, useReadFeedQuery } from './queries';

export * from './types';
export type { FeedItem } from './queries';
