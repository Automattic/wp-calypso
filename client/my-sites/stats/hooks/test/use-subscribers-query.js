import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import useSubscribersQuery from '../use-subscribers-query';

describe( 'useSubscribersQuery', () => {
	const queryClient = new QueryClient();
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	beforeEach( () => {
		nock.cleanAll();
	} );

	afterAll( () => {
		nock.restore();
	} );

	it( 'should return data on successful request', async () => {
		const expectedData = [
			{ id: 1, email: 'subscriber1@example.com' },
			{ id: 2, email: 'subscriber2@example.com' },
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/stats/subscribers' )
			.query( { unit: 'day', quantity: 7 } )
			.reply( 200, { data: expectedData } );

		const { result, waitFor } = renderHook( () => useSubscribersQuery( 123, 'day', 7 ), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( expectedData );
	} );

	it( 'should handle error on failed request', async () => {
		const errorMessage = 'Request failed with status code 404';

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/stats/subscribers' )
			.query( { unit: 'day', quantity: 7 } )
			.replyWithError( errorMessage );

		const { result, waitFor } = renderHook( () => useSubscribersQuery( 123, 'day', 7 ), {
			wrapper,
		} );

		await waitFor( () => result.current.isError );

		expect( result.current.error.message ).toEqual( errorMessage );
	} );
} );
