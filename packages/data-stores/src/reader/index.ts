import { SiteSubscriptionsQueryPropsProvider, useSiteSubscriptionsQueryProps } from './contexts';
import { useCacheKey, useIsLoggedIn, useSubscriberEmailAddress } from './hooks';
import {
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePostNotifyMeOfNewCommentsMutation,
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
	subscriptionsCountQueryKeyPrefix,
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
	subscriptionsCountQueryKeyPrefix,
	useCacheKey,
	useIsLoggedIn,
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	usePendingPostSubscriptionsQuery,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePendingSiteSubscriptionsQuery,
	usePostNotifyMeOfNewCommentsMutation,
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
export * from './types';
