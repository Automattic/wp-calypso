import { useSelect } from '@wordpress/data';
import { useQuery } from 'react-query';
import { register as registerUserStore } from '../../user';
import { fetchFromApi } from '../helpers';
import type { SubscriptionManagerUserSettings } from '../types';

// Credentials are only needed to create users
const USER_STORE = registerUserStore( { client_id: '', client_secret: '' } );

type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings;
};

const useSubscriptionManagerUserSettingsQuery = () => {
	const isLoggedIn = useSelect( ( select ) =>
		select( USER_STORE ).isCurrentUserLoggedIn()
	) as boolean;
	return useQuery(
		'siteSettings',
		async () => {
			const { settings } = await fetchFromApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				isLoggedIn,
			} );
			return settings;
		},
		{
			initialData: {},
		}
	);
};

export { useSubscriptionManagerUserSettingsQuery };
