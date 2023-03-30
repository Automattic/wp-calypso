import { Reader } from '@automattic/data-stores';
import { UserSettings } from '../user-settings';

const Settings = () => {
	const { data: settings, isIdle, isLoading } = Reader.SubscriptionManager.useUserSettingsQuery();
	return <UserSettings loading={ isIdle || isLoading } value={ settings } />;
};

export default Settings;
