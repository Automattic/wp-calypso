/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSiteTransfer } from '..';

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const render = ( { siteId, retry = 0 } ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook( () => useSiteTransfer( siteId, { retry } ), {
		wrapper: Wrapper( queryClient ),
	} );

	return {
		...renderResult,
		queryClient,
	};
};

const TRANSFER_NOT_INITIATED = () => ( {
	code: 'no_transfer_record',
	message: 'Transfer record not found for blog `232353116`',
	data: {
		status: 404,
	},
} );

const TRANSFER_PROVISIONED = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'provisioned',
} );

const TRANSFER_COMPLETED = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'completed',
} );

const TRANSFER_ACTIVE = ( siteId: number ) => ( {
	atomic_transfer_id: '1253811',
	blog_id: siteId,
	status: 'active',
} );

/**
 * Please, pay attention there is a difference between the way the calypso wpcom http library process requests when it is running on node.
 * Running on Node env, like the tests, the TRANSFER_NOT_INITIATED response should be a 404 status code.
 * On the other hand, when running on the browser, the response should be a 200 status code with a JSON body with status 404.
 */
describe( 'useSiteTransfer', () => {
	beforeAll( () => {
		// Advance all node timers to avoid the hook to wait the default time to pool the status.
		jest.useFakeTimers( { advanceTimers: 500 } );
		nock.disableNetConnect();
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'returns status "idle" when there is no siteId available', () => {
		const { result } = render( { siteId: undefined } );

		expect( result.current ).toEqual( {
			completed: false,
			status: 'idle',
			error: null,
		} );
	} );

	it( 'returns the status "success" when all flow was executed with success', async () => {
		const siteId = 4444;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 404, TRANSFER_NOT_INITIATED() )
			.post( `/wpcom/v2/sites/${ siteId }/atomic/transfers`, {
				context: 'unknown',
				transfer_intent: 'migrate',
				plugin_slug: 'wpcom-migration',
			} )
			.reply( 200, TRANSFER_ACTIVE( siteId ) )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.times( 2 )
			.reply( 200, TRANSFER_COMPLETED( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: true,
					status: 'success',
					error: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns the status "success" when the transfer status is "completed"', async () => {
		const siteId = 12345;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED( siteId ) );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				completed: true,
				status: 'success',
				error: null,
			} );
		} );
	} );

	it( 'returns the status "pending" while is retrying to get the status', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.times( 2 )
			.reply( 500, new Error( 'Internal Server Error' ) );

		const { result } = render( { siteId, retry: 1 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: false,
					status: 'pending',
					error: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns status "pending" when the status transfer is different of "completed', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.reply( 200, TRANSFER_PROVISIONED( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: false,
					status: 'pending',
					error: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns the status "error" when the retry limit was reached', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.times( 2 )
			.reply( 500, new Error( 'Internal Server Error' ) );

		const { result } = render( { siteId, retry: 1 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: false,
					status: 'error',
					error: expect.any( Error ),
				} );
			},
			{ timeout: 3000 }
		);
	} );
} );
