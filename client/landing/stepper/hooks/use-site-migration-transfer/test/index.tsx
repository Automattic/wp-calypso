/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSiteMigrationTransfer } from '../';
import { transferStates } from '../../../../../state/automated-transfer/constants';

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const render = ( { siteId } ) => {
	const queryClient = new QueryClient();

	// It is important to set the retry option to false to avoid the hook to retry the request when it fails.
	queryClient.setDefaultOptions( { queries: { retry: false } } );

	const renderResult = renderHook( () => useSiteMigrationTransfer( siteId ), {
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
	created_at: '2024-04-24 08:32:07',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const TRANSFER_COMPLETED = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'completed',
	created_at: '2024-04-24 08:32:07',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const TRANSFER_ACTIVE = ( siteId: number ) => ( {
	atomic_transfer_id: 1253811,
	blog_id: siteId,
	status: 'active',
	created_at: '2024-04-23 16:21:01',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

/**
 * Please, pay attention there is a difference between the way the calypso wpcom http library process requests when it is running on node.
 * Running on Node env, like the tests, the TRANSFER_NOT_INITIATED response should be a 404 status code.
 * On the other hand, when running on the browser, the response should be a 200 status code with a JSON body with status 404.
 */
describe( 'useSiteMigrationTransfer', () => {
	beforeAll( () => {
		// Advance all node timers to avoid the hook to wait the default time to pool the status.
		jest.useFakeTimers( { advanceTimers: 500 } );
		nock.disableNetConnect();
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	it( 'returns errors', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 500, new Error( 'Internal Server Error' ) );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				completed: undefined,
				status: undefined,
				error: expect.any( Error ),
				isTransferring: undefined,
			} );
		} );
	} );

	it( 'returns the latest transfer status', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				completed: true,
				status: transferStates.COMPLETED,
				isTransferring: false,
				error: null,
			} );
		} );
	} );

	it( 'starts the transfer process if it is not transferring', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 404, TRANSFER_NOT_INITIATED )
			.post( `/wpcom/v2/sites/123/atomic/transfers`, {
				context: 'unknown',
				transfer_intent: 'migrate',
			} )
			.once()
			.reply( 200, TRANSFER_ACTIVE( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					isTransferring: true,
					completed: false,
					status: transferStates.ACTIVE,
					error: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'starts to pool the status after start a new flow', async () => {
		const siteId = 4444;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 404, TRANSFER_NOT_INITIATED() )
			.post( `/wpcom/v2/sites/${ siteId }/atomic/transfers`, {
				context: 'unknown',
				transfer_intent: 'migrate',
			} )
			.once()
			.reply( 200, TRANSFER_ACTIVE( siteId ) )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: true,
					isTransferring: false,
					status: transferStates.COMPLETED,
					error: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'stops to pool when the transfer is completed', async () => {
		const siteId = 555;

		const scope = nock( 'https://public-api.wordpress.com:443' );
		scope
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_ACTIVE )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_PROVISIONED( siteId ) )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: true,
					isTransferring: false,
					status: transferStates.COMPLETED,
					error: null,
				} );
			},
			{ timeout: 9000 }
		);
	} );
} );
