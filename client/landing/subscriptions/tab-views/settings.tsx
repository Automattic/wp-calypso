import { SubscriptionManager } from '@automattic/data-stores';
import { Spinner } from '@wordpress/components';
import { Notice } from '../notice';
import { UserSettings } from '../user-settings';

const Settings = () => {
	const { data: settings, isIdle, isLoading, error } = SubscriptionManager.useUserSettingsQuery();

	if ( error ) {
		// todo: translate when we have agreed on the error message
		return (
			<Notice type="error">An error occurred while fetching your subscription settings.</Notice>
		);
	}

	if ( isIdle || isLoading ) {
		return (
			<div className="user-settings">
				<Spinner />
			</div>
		);
	}

	return <UserSettings value={ settings } />;
};

export default Settings;
