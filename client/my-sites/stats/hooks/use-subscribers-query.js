import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

function querySubscribers( siteId, period = 'month', quantity = 30 ) {
	return wpcom.req
		.get( {
			apiNamespace: 'rest/v1.1',
			path: `/sites/${ siteId }/stats/subscribers?unit=${ period }&quantity=${ quantity }`,
		} )
		.then( ( data ) => {
			return data;
		} );
}

function selectSubscribers( api ) {
	return api?.items?.map( ( item ) => {
		return {
			date: item.date,
			unit: item.unit,
			data: item.data.map( ( dataSet ) => {
				return {
					[ item.fields[ 0 ] ]: dataSet[ 0 ],
					[ item.fields[ 1 ] ]: dataSet[ 1 ],
					[ item.fields[ 2 ] ]: dataSet[ 2 ],
				};
			} ),
		};
	} )?.[ 0 ];
}

export default function useSubscribersQuery( siteId, period, quantity ) {
	// TODO: Account for other query parameters before release.
	return useQuery(
		[ 'stats', 'subscribers', siteId, period, quantity ],
		() => querySubscribers( siteId, period, quantity ),
		{
			select: selectSubscribers,
		}
	);
}
