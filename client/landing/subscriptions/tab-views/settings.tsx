import { Reader } from '@automattic/data-stores';
import SubscriptionManager from '@automattic/subscription-manager';

const Settings = () => {
	const { data: settings, isIdle, isLoading } = Reader.useSubscriptionManagerUserSettingsQuery();
	return <SubscriptionManager.UserSettings loading={ isIdle || isLoading } value={ settings } />;
};

export default Settings;
