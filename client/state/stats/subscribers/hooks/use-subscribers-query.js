import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { errorNotice } from '../../../notices/actions';
import { receiveStatSubscribers } from '../actions';

const mockData = {
	items: [
		{
			date: '2023-03-16',
			unit: 'month',
			fields: [ 'period', 'subscribers', 'subscribers_change' ],
			data: [
				[ '2023-03-01', 51131, 547 ],
				[ '2023-02-01', 51881, 750 ],
				[ '2023-01-01', 52662, 781 ],
				[ '2022-12-01', 52782, 120 ],
				[ '2022-11-01', 53541, 759 ],
				[ '2022-10-01', 53527, -14 ],
				[ '2022-09-01', 53853, 326 ],
				[ '2022-08-01', 54243, 390 ],
				[ '2022-07-01', 55097, 854 ],
				[ '2022-06-01', 55088, -9 ],
				[ '2022-05-01', 55208, 120 ],
				[ '2022-04-01', 55764, 556 ],
				[ '2022-03-01', 56622, 858 ],
				[ '2022-02-01', 57363, 741 ],
				[ '2022-01-01', 57279, -84 ],
				[ '2021-12-01', 57468, 189 ],
				[ '2021-11-01', 57444, -24 ],
				[ '2021-10-01', 57530, 86 ],
				[ '2021-09-01', 58404, 874 ],
				[ '2021-08-01', 58468, 64 ],
				[ '2021-07-01', 58512, 44 ],
				[ '2021-06-01', 59469, 957 ],
				[ '2021-05-01', 59795, 326 ],
				[ '2021-04-01', 60511, 716 ],
				[ '2021-03-01', 61193, 682 ],
				[ '2021-02-01', 61448, 255 ],
				[ '2021-01-01', 61682, 234 ],
				[ '2020-12-01', 61934, 252 ],
				[ '2020-11-01', 62927, 993 ],
				[ '2020-10-01', 62957, 30 ],
				[ '2020-09-01', 63385, 428 ],
			],
		},
	],
};

function querySubscribers() {
	// TODO: remove when the endpoint is ready
	return new Promise( ( resolve ) => {
		setTimeout( () => resolve( mockData ), 3000 );
	} );

	// return <wpcom endpoint>.req
	// 	.get( {
	// 		apiNamespace: '?',
	// 		path: '/abc123',
	// 	} )
	// 	.then( ( data ) => {
	// 		// magic
	// 	} );
}

function selectSubscribers( api ) {
	return api.items.map( ( item ) => {
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
	} );
}

export default function useSubscribersQuery( siteId ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useQuery( [ 'stats', 'subscribers', siteId ], querySubscribers, {
		select: selectSubscribers,
		onSuccess: ( data ) => {
			dispatch( receiveStatSubscribers( siteId, data ) );
		},
		onError: () => {
			dispatch(
				errorNotice(
					translate( 'We were unable to retrieve your latest subscriber. Please try again later.' )
				)
			);
		},
	} );
}
