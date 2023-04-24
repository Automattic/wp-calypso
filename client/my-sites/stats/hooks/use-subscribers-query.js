import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

function querySubscribers( siteId, period, quantity ) {
	return wpcom.req.get(
		{
			method: 'GET',
			apiNamespace: 'rest/v1.1',
			path: `/sites/${ siteId }/stats/subscribers`,
		},
		{
			unit: period,
			quantity,
			http_envelope: 1,
		}
	);
}

function selectSubscribers( payload ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	return {
		date: payload.date,
		unit: payload.unit,
		data: payload.data.map( ( dataSet ) => {
			return {
				[ payload.fields[ 0 ] ]: dataSet[ 0 ],
				[ payload.fields[ 1 ] ]: dataSet[ 1 ],
				[ payload.fields[ 2 ] ]: dataSet[ 2 ],
			};
		} ),
	};
}

export default function useSubscribersQuery( siteId, period, quantity ) {
	// TODO: Account for other query parameters before release.
	return useQuery(
		[ 'stats', 'subscribers', siteId, period, quantity ],
		() => querySubscribers( siteId, period, quantity ),
		{
			select: selectSubscribers,
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);
}
