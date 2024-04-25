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

	const renderResult = renderHook( () => useSiteMigrationTransfer( siteId ), {
		wrapper: Wrapper( queryClient ),
	} );

	return {
		...renderResult,
		queryClient,
	};
};

const TRANSFER_NOT_INITIATED_PAYLOAD = () => ( {
	code: 'no_transfer_record',
	message: 'Transfer record not found for blog `232256476`',
	data: {
		status: 404,
	},
} );

const TRANSFER_PROVISIONED_PAYLOAD = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'provisioned',
	created_at: '2024-04-24 08:32:07',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const TRANSFER_COMPLETED_PAYLOAD = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'completed',
	created_at: '2024-04-24 08:32:07',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const TRANSFER_ACTIVE_PAYLOAD = ( siteId: number ) => ( {
	atomic_transfer_id: 1253811,
	blog_id: siteId,
	status: 'active',
	created_at: '2024-04-23 16:21:01',
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

jest.useFakeTimers( { advanceTimers: 500 } );

describe( 'useSiteMigrationTransfer', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'returns the latest transfer status', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED_PAYLOAD );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				status: transferStates.COMPLETED,
				error: null,
			} );
		} );
	} );

	it( 'starts the transfer process if it is not transferring', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_NOT_INITIATED_PAYLOAD );

		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/123/atomic/transfers`, {
				context: 'unknown',
				transfer_intent: 'migrate',
			} )
			.once()
			.reply( 200, TRANSFER_ACTIVE_PAYLOAD( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
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
			.reply( 200, TRANSFER_NOT_INITIATED_PAYLOAD() );

		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/${ siteId }/atomic/transfers`, {
				context: 'unknown',
				transfer_intent: 'migrate',
			} )
			.once()
			.reply( 200, TRANSFER_ACTIVE_PAYLOAD( siteId ) );

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED_PAYLOAD( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: transferStates.COMPLETED,
					error: null,
				} );
			},
			{ timeout: 9000 }
		);
	} );

	it( 'stops to pool when the transfer is completed', async () => {
		const siteId = 555;

		const scope = nock( 'https://public-api.wordpress.com:443' );
		scope
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_ACTIVE_PAYLOAD );

		scope
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_PROVISIONED_PAYLOAD( siteId ) );

		scope
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED_PAYLOAD( siteId ) );

		const { result } = render( { siteId } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: transferStates.COMPLETED,
					error: null,
				} );
			},
			{ timeout: 9000 }
		);
	} );
} );
