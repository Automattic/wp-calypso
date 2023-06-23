import { useSubscriberEmailAddress, useIsLoggedIn, useCacheKey } from './hooks';
import {
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteSubscribeMutation,
	useSiteUnsubscribeMutation,
	useUserSettingsMutation,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	useSiteNotifyMeOfNewPostsMutation,
	useSiteEmailMeNewPostsMutation,
	useSiteEmailMeNewCommentsMutation,
} from './mutations';
import {
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
	usePendingSiteSubscriptionsQuery,
	usePendingPostSubscriptionsQuery,
	useSiteSubscriptionDetailsQuery,
} from './queries';

export const SubscriptionManager = {
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSiteSubscribeMutation,
	useSiteUnsubscribeMutation,
	useSubscriptionsCountQuery,
	useSubscriberEmailAddress,
	useUserSettingsQuery,
	useUserSettingsMutation,
	usePendingSiteSubscriptionsQuery,
	usePendingPostSubscriptionsQuery,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	useSiteNotifyMeOfNewPostsMutation,
	useSiteEmailMeNewPostsMutation,
	useSiteEmailMeNewCommentsMutation,
	useIsLoggedIn,
	useSiteSubscriptionDetailsQuery,
	useCacheKey,
};

export {
	EmailDeliveryFrequency,
	PostSubscriptionsSortBy,
	SiteSubscriptionsFilterBy,
	SiteSubscriptionsSortBy,
} from './constants';

export { isErrorResponse } from './helpers';

export * from './types';
