import { useQuery } from '@tanstack/react-query';
import { wpcom } from '../wpcom-request';

export const useHappinessEngineersQuery = () =>
	useQuery<
		{
			display_name: string;
			name: string;
			avatar_URL: string;
		}[]
	>( {
		queryKey: [ 'happinessEngineers' ],
		queryFn: async () =>
			await wpcom.req.get( { path: '/meta/happiness-engineers/', apiVersion: '1.1' } ),
		refetchOnWindowFocus: false,
		staleTime: Infinity,
	} );
