import { SubscriptionManager } from '@automattic/data-stores';
import { UserSettings } from '../user-settings';

const Settings = () => {
	const { data: settings, isIdle, isLoading } = SubscriptionManager.useUserSettingsQuery();
	return <UserSettings loading={ isIdle || isLoading } value={ settings } />;
};

export default Settings;
