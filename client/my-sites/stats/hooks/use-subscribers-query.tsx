import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface SubscriberPayload {
	date: string;
	unit: string;
	data: any[]; // TODO: add type
	fields: string[];
}

export interface SubscribersData {
	date?: string;
	unit?: string;
	data?: {
		[ key: string ]: string | number;
	}[];
}

function querySubscribers(
	siteId: number | null,
	period: string,
	quantity: number,
	date?: string
): Promise< SubscriberPayload > {
	const periodStart = date ? new Date( date ) : new Date();
	const formattedDate = periodStart.toISOString().slice( 0, 10 );

	const query = {
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

function selectSubscribers( payload: SubscriberPayload ): SubscribersData {
	if ( ! payload?.data ) {
		// return an empty SubscribersData object if no payload data
		return {};
	}

	return {
		// For `week` period replace `W` separator to match the format.
		date: payload.date,
		unit: payload.unit,
		data: payload.data.map( ( dataSet ) => {
			return {
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
): UseQueryResult< SubscribersData, unknown > {
	const queryDate = date ? date.toISOString() : new Date().toISOString();

	return useQuery( {
		queryKey: [ 'stats', 'subscribers', siteId, period, quantity, queryDate ],
		queryFn: () => querySubscribers( siteId, period, quantity, queryDate ),
		select: selectSubscribers,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}

export function useSubscribersQueries(
	siteId: number | null,
	period: string,
	quantity: number,
	dates: string[]
): { isLoading: boolean; isError: boolean; subscribersData: SubscribersData[] } {
	const queryConfigs = dates.map( ( date ) => ( {
		queryKey: [ 'stats', 'subscribers', siteId, period, quantity, date ],
		queryFn: () => querySubscribers( siteId, period, quantity, date ),
		select: selectSubscribers,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} ) );

	const results = useQueries( { queries: queryConfigs } ) as UseQueryResult<
		SubscriberPayload,
		unknown
	>[];

	const isLoading = results.some( ( result ) => result.isLoading );
	const isError = results.some( ( result ) => result.isError );
	const subscribersData = results.map( ( result ) => result.data );

	return { isLoading, isError, subscribersData };
}
