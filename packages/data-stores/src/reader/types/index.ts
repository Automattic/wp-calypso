export type EmailFormatType = 'html' | 'text';

export type SubscriptionManagerUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: number; // 0-6, 0 is Sunday
	delivery_hour: number; // 0-23, 0 is midnight
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
