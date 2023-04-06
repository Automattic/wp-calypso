import { SubscriptionManager } from '@automattic/data-stores';
import { TabView } from 'calypso/landing/subscriptions/components/tab-view';
import { UserSettings } from 'calypso/landing/subscriptions/components/user-settings';

const Settings = () => {
	const { data: settings, isIdle, isLoading, error } = SubscriptionManager.useUserSettingsQuery();

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscription settings.' : '';

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isIdle || isLoading }>
			<UserSettings value={ settings } />
		</TabView>
	);
};

export default Settings;
