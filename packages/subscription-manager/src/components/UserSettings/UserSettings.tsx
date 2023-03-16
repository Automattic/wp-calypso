import type { SubscriptionManagerUserSettings } from '@automattic/data-stores';

type UserSettingsProps = {
	value?: SubscriptionManagerUserSettings;
	onChange?: ( value: SubscriptionManagerUserSettings ) => void;
	loading?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( { value = {}, loading = false }: UserSettingsProps ) => (
	<div className="user-settings">User settings will go here</div>
);

export default UserSettings;
