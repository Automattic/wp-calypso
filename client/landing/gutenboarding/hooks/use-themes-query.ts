import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export function useThemesQuery( filter: string ): UseQueryResult< any[] > {
	return useQuery(
		[ 'themes', filter ],
		() =>
			wpcom.req.get( '/themes', {
				search: '',
				number: 50,
				tier: '',
				filter,
				apiVersion: '1.2',
			} ),
		{
			refetchIntervalInBackground: false,
			refetchOnWindowFocus: false,
			select: ( responseBody ) => responseBody.themes,
		}
	);
}
