import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export function querySubscribers( siteId, period, quantity, date ) {
	const query = {
		unit: period,
		quantity,
		http_envelope: 1,
	};

	if ( date ) {
		query.date = date;
	}

	return wpcom.req.get(
		{
			method: 'GET',
			apiNamespace: 'rest/v1.1',
			path: `/sites/${ siteId }/stats/subscribers`,
		},
		query
	);
}

export function selectSubscribers( payload ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	return {
		date: payload.date,
		unit: payload.unit,
		data: payload.data.map( ( dataSet ) => {
			return {
				// For `week` period replace `W` separator to match the format.
				[ payload.fields[ 0 ] ]:
					payload.unit !== 'week' ? dataSet[ 0 ] : dataSet[ 0 ].replaceAll( 'W', '-' ),
				[ payload.fields[ 1 ] ]: dataSet[ 1 ],
				[ payload.fields[ 2 ] ]: dataSet[ 2 ],
			};
		} ),
	};
}

export default function useSubscribersQuery( siteId, period, quantity, date ) {
	// TODO: Account for other query parameters before release.
	return useQuery( {
		queryKey: [ 'stats', 'subscribers', siteId, period, quantity, date ],
		queryFn: () => querySubscribers( siteId, period, quantity, date ),
		select: selectSubscribers,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
