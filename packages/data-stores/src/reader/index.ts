import { useSubscriberEmailAddress } from './hooks';
import {
	usePostUnfollowMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteUnfollowMutation,
	useUserSettingsMutation,
} from './mutations';
import {
	useSiteSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
} from './queries';

export const SubscriptionManager = {
	usePostUnfollowMutation,
	useSiteDeliveryFrequencyMutation,
	useSiteSubscriptionsQuery,
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
