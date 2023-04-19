import { useSubscriberEmailAddress } from './hooks';
import {
	usePostUnfollowMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteUnfollowMutation,
	useUserSettingsMutation,
} from './mutations';
import {
	SiteSubscriptionsSortBy,
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
} from './queries';

export const SubscriptionManager = {
	SiteSubscriptionsSortBy,
	usePostUnfollowMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteSubscriptionsQuery,
	usePostSubscriptionsQuery,
	useSiteUnfollowMutation,
	useSubscriptionsCountQuery,
	useSubscriberEmailAddress,
	useUserSettingsQuery,
	useUserSettingsMutation,
};

// Types
export type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
	EmailFormatType,
	SubscriptionManagerUserSettings,
} from './types';
