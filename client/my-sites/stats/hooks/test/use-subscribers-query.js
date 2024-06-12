import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import useSubscribersQuery from '../use-subscribers-query';

describe( 'useSubscribersQuery', () => {
	const testingSiteId = 123;
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
		const testingDate = '2023-04-28';
		const testingRequestUnit = 'month';
		const expectedData = {
			date: testingDate,
			unit: testingRequestUnit,
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
			.get( `/rest/v1.1/sites/${ testingSiteId }/stats/subscribers` )
			.query( { unit: testingRequestUnit, quantity: 7, http_envelope: 1, date: testingDate } )
			.reply( 200, { ...responseAPI.body } );

		const { result, waitFor } = renderHook(
			() => useSubscribersQuery( testingSiteId, testingRequestUnit, 7, new Date( testingDate ) ),
			{
				wrapper,
			}
		);

		await waitFor( () => result.current.isSuccess );
		// await waitFor(() => expect(result.current.isSuccess).toBe(true));

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

		// await waitFor( () => result.current.isError );
		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		// expect( result.current.error.message ).toEqual( errorMessage );
	} );
} );
