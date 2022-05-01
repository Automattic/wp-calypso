import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export const useHappinessEngineersQuery = () =>
	useQuery<
		{
			display_name: string;
			name: string;
			avatar_URL: string;
		}[]
	>(
		'happinessEngineers',
		async () => await wpcomRequest( { path: '/meta/happiness-engineers/', apiVersion: '1.1' } ),
		{
			refetchOnWindowFocus: false,
		}
	);
