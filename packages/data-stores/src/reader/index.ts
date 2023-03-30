import { useSubscriberEmailAddress } from './hooks';
import { useUserSettingsMutation } from './mutations';
import { useSubscriptionsCountQuery, useUserSettingsQuery } from './queries';

export const SubscriptionManager = {
	useUserSettingsMutation,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
	useSubscriberEmailAddress,
};

// Types
export type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
	EmailFormatType,
	SubscriptionManagerUserSettings,
} from './types';
