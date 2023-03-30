import { useSubscriberEmailAddress } from './hooks';
import { useSiteDeliveryFrequencyMutation, useUserSettingsMutation } from './mutations';
import { useSubscriptionsCountQuery, useUserSettingsQuery } from './queries';

export const SubscriptionManager = {
	useUserSettingsMutation,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
	useSiteDeliveryFrequencyMutation,
	useSubscriberEmailAddress,
};

// Types
export type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
	EmailFormatType,
	SubscriptionManagerUserSettings,
} from './types';
