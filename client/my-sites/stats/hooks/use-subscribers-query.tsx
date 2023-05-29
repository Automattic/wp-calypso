import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export function querySubscribers(
	siteId: number | null,
	period: string,
	quantity: number,
	date?: string
): Promise< any > {
	// Create a date object from the passed date string or create a new date object if no date is provided.
	const periodStart = date ? new Date( date ) : new Date();

	// Formatted date
	const formattedDate = periodStart.toISOString().slice( 0, 10 );

	const query: { unit: string; quantity: number; http_envelope: number; date: string } = {
		unit: period,
		quantity,
		http_envelope: 1,
		date: formattedDate,
	};

	return wpcom.req.get(
		{
			method: 'GET',
			apiNamespace: 'rest/v1.1',
			path: `/sites/${ siteId }/stats/subscribers`,
		},
		query
	);
}

export function selectSubscribers( payload: {
	date: string;
	unit: string;
	// todo: add type
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
	siteId: number | null,
	period: string,
	quantity: number,
	date?: Date
) {
	const queryDate = date.toISOString();

	// TODO: Account for other query parameters before release.
	return useQuery( {
		queryKey: [ 'stats', 'subscribers', siteId, period, quantity, queryDate ],
		queryFn: () => querySubscribers( siteId, period, quantity, queryDate ),
		select: selectSubscribers,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
