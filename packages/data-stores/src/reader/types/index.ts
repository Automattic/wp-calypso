export type EmailFormatType = 'html' | 'text';

export type DeliveryWindowDayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DeliveryWindowHourType = 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22;

export type SubscriptionManagerUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: DeliveryWindowDayType; // 0-6, 0 is Sunday
	delivery_hour: DeliveryWindowHourType; // 0-23, 0 is midnight
	blocked: boolean;
	email: string;
} >;

export type SubscriptionManagerSubscriptionsCount = {
	blogs: number | null;
	comments: number | null;
	pending: number | null;
};

export type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings;
};
