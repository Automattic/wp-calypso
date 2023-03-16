type SubscriptionUserSettings = Partial< {
	mail_option: 'html' | 'text';
	delivery_day: number; // 0-6, 0 is Sunday
	delivery_hour: number; // 0-23, 0 is midnight
	blocked: boolean;
} >;

type UserSettingsProps = {
	value: SubscriptionUserSettings;
	onChange?: ( value: SubscriptionUserSettings ) => void;
	loading: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( { value = {}, loading = false }: UserSettingsProps ) => (
	<div className="user-settings">User settings will go here</div>
);

export default UserSettings;
