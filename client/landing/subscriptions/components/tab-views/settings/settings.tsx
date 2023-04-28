import { SubscriptionManager } from '@automattic/data-stores';
import { UserSettings } from 'calypso/landing/subscriptions/components/user-settings';
import TabView from '../tab-view';

const Settings = () => {
	const {
		data: settings,
		isInitialLoading,
		isLoading,
		error,
	} = SubscriptionManager.useUserSettingsQuery();

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscription settings.' : '';

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isInitialLoading || isLoading }>
			<UserSettings value={ settings } />
		</TabView>
	);
};

export default Settings;
