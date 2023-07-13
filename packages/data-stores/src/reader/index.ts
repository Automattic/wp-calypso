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

export {
	EmailDeliveryFrequency,
	PostSubscriptionsSortBy,
	SiteSubscriptionsFilterBy,
	SiteSubscriptionsSortBy,
} from './constants';
export { isErrorResponse, isValidId } from './helpers';
export { UnsubscribedFeedsSearchProvider, useUnsubscribedFeedsSearch } from './contexts';
export { useReadFeedSearchQuery, useReadFeedSiteQuery } from './queries';

export * from './types';
export type { FeedItem } from './queries';
