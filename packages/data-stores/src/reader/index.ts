import { useSubscriberEmailAddress } from './hooks';
import { useUserSettingsMutation } from './mutations';
import {
	useSiteSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useUserSettingsQuery,
} from './queries';

export const SubscriptionManager = {
	useSiteSubscriptionsQuery,
	useSubscriptionsCountQuery,
	useSubscriberEmailAddress,
	useUserSettingsMutation,
	useUserSettingsQuery,
};

// Types
export type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
	EmailFormatType,
	SubscriptionManagerUserSettings,
} from './types';
