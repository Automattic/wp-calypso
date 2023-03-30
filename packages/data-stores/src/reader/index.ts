import { useSubscriberEmailAddress } from './hooks';
import { useSiteDeliveryFrequencyMutation, useUserSettingsMutation } from './mutations';
import {
	useSiteSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
} from './queries';

export const SubscriptionManager = {
	useSiteDeliveryFrequencyMutation,
	useSiteSubscriptionsQuery,
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
