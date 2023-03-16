import { useQuery } from 'react-query';
import { fetchFromApi } from '../helpers';
import type { SubscriptionManagerUserSettings } from '../types';

type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings;
};

const useSubscriptionManagerUserSettingsQuery = () => {
	return useQuery( 'siteSettings', async () => {
		const { settings } = await fetchFromApi< EmailSettingsAPIResponse >( '/read/email-settings' );
		return settings;
	} );
};

export { useSubscriptionManagerUserSettingsQuery };
