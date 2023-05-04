import { useSubscriberEmailAddress, useIsLoggedIn } from './hooks';
import {
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteUnsubscribeMutation,
	useUserSettingsMutation,
	usePendingSiteConfirmMutation,
	usePendingSiteDeleteMutation,
	usePendingPostConfirmMutation,
	usePendingPostDeleteMutation,
	useSiteNotifyMeOfNewPostsMutation,
	useSiteEmailMeNewPostsMutation,
} from './mutations';
import {
	PostSubscriptionsSortBy,
	SiteSubscriptionsSortBy,
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
	usePendingSiteSubscriptionsQuery,
	usePendingPostSubscriptionsQuery,
} from './queries';

export const SubscriptionManager = {
	PostSubscriptionsSortBy,
	SiteSubscriptionsSortBy,
	usePostUnsubscribeMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
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
	useIsLoggedIn,
};

// Types
export type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
	EmailFormatType,
	SubscriptionManagerUserSettings,
} from './types';
