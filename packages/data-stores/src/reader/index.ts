import { useSubscriberEmailAddress } from './hooks';
import {
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
