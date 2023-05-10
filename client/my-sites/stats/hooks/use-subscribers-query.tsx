import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

// Here I'm assuming `siteId` is a number, and `period` and `date` are strings.
// `quantity` is also assumed to be a number. Adjust these types if that's not the case.
export function querySubscribers(
	siteId: number,
	period: string,
	quantity: number,
	date?: string
): Promise< any > {
	const query: { unit: string; quantity: number; http_envelope: number; date?: string } = {
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

// Here I'm assuming `payload` has a `date` and `unit` that are strings, and `data` and `fields` that are arrays.
// Adjust these types if that's not the case.
export function selectSubscribers( payload: {
	date: string;
	unit: string;
	data: any[];
	fields: string[];
} ) {
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

export default function useSubscribersQuery(
	siteId: number,
	period: string,
	quantity: number,
	date?: string
) {
	// TODO: Account for other query parameters before release.
	return useQuery( {
		queryKey: [ 'stats', 'subscribers', siteId, period, quantity, date ],
		queryFn: () => querySubscribers( siteId, period, quantity, date ),
		select: selectSubscribers,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
