type SubscriptionUserSettings = Partial< {
	subscription_delivery_mail_option: 'html' | 'text';
	subscription_delivery_day: number; // 0-6, 0 is Sunday
	subscription_delivery_hour: number; // 0-23, 0 is midnight
	subscription_delivery_email_blocked: boolean;
} >;

type UserSettingsProps = {
	value?: SubscriptionUserSettings;
	onChange?: ( value: SubscriptionUserSettings ) => void;
	loading?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( props: UserSettingsProps ) => (
	<div className="user-settings">User settings will go here</div>
);

export default UserSettings;
