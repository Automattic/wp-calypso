import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import useSubscribersQuery from '../use-subscribers-query';

describe( 'useSubscribersQuery', () => {
	const queryClient = new QueryClient();
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	const responseAPI = {
		body: {
			unit: 'month',
			date: '2023-04-28',
			fields: [ 'period', 'subscribers', 'subscribers_change' ],
			data: [
				[ '2023-04-01', 2000, 1 ],
				[ '2023-04-02', 2005, 5 ],
			],
		},
	};

	afterAll( () => {
		nock.cleanAll();
	} );

	it( 'should return data on successful request', async () => {
		const expectedData = {
			date: '2023-04-28',
			unit: 'month',
			data: [
				{
					period: '2023-04-01',
					subscribers: 2000,
					subscribers_change: 1,
				},
				{
					period: '2023-04-02',
					subscribers: 2005,
					subscribers_change: 5,
				},
			],
		};

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/123/stats/subscribers' )
			.query( { unit: 'day', quantity: 7, http_envelope: 1 } )
			.reply( 200, { ...responseAPI.body } );

		const { result, waitFor } = renderHook( () => useSubscribersQuery( 123, 'day', 7 ), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( expectedData );
	} );

	it.skip( 'should handle error on failed request', async () => {
		const errorMessage = 'Request failed with status code 404';

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/123/stats/subscribers' )
			.query( { unit: 'day', quantity: 7, http_envelope: 1 } )
			.replyWithError( errorMessage );

		const { result, waitFor } = renderHook( () => useSubscribersQuery( 123, 'day', 7 ), {
			wrapper,
		} );

		await waitFor( () => result.current.isError );

		expect( result.current.error.message ).toEqual( errorMessage );
	} );
} );
