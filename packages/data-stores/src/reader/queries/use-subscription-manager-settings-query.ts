import { useQuery } from 'react-query';
import { fetchFromApi } from '../helpers';

type SubscriptionManagerSettings = {
	settings: object;
};

const useSubscriptionManagerSettingsQuery = () => {
	return useQuery( 'siteSettings', async () => {
		const { settings } = await fetchFromApi< SubscriptionManagerSettings >(
			'/read/email-settings'
		);
		return settings;
	} );
};

export { useSubscriptionManagerSettingsQuery };
