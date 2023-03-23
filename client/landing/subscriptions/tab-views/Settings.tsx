import { Reader } from '@automattic/data-stores';
import SubscriptionManager from '@automattic/subscription-manager';

const Settings = () => {
	const { data: settings } = Reader.useSubscriptionManagerUserSettingsQuery();
	return <SubscriptionManager.UserSettings value={ settings } />;
};

export default Settings;
