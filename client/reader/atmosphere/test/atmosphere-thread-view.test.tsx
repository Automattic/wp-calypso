/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AtmosphereThreadView } from '../atmosphere-thread-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const listUrl = '/wpcom/v2/reader/atmosphere/connections';
const threadUrl = '/wpcom/v2/reader/atmosphere/connections/7/thread';

const DID = 'did:plc:abc234567defghi234567jkl';
const RKEY = '3kabcdefghijk';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, retryDelay: 0 } },
	} );
}

describe( 'AtmosphereThreadView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'renders a status announcement while connections are pending', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( listUrl )
			.delay( 100 )
			.reply( 200, { connections: [] } );

		renderWithProvider( <AtmosphereThreadView connectionId={ 7 } did={ DID } rkey={ RKEY } />, {
			queryClient: makeClient(),
		} );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /loading/i );
	} );

	it( 'redirects to /reader/atmosphere when the connection is missing', async () => {
		nock( 'https://public-api.wordpress.com' ).get( listUrl ).reply( 200, { connections: [] } );

		renderWithProvider( <AtmosphereThreadView connectionId={ 7 } did={ DID } rkey={ RKEY } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'shows an error and retry when the connections query fails', async () => {
		// Retry predicate retries unknown errors up to 2 more times before
		// surrendering to the error UI (3 total attempts).
		nock( 'https://public-api.wordpress.com' )
			.get( listUrl )
			.times( 3 )
			.reply( 500, { error: 'unknown' } );

		renderWithProvider( <AtmosphereThreadView connectionId={ 7 } did={ DID } rkey={ RKEY } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'alert' ) ).toBeInTheDocument() );
		expect( screen.getByRole( 'button', { name: /try again/i } ) ).toBeInTheDocument();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'does not retry connection_not_found and renders the error UI', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( listUrl )
			.reply( 404, { error: 'connection_not_found' } );

		renderWithProvider( <AtmosphereThreadView connectionId={ 7 } did={ DID } rkey={ RKEY } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'alert' ) ).toBeInTheDocument() );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'renders the thread panel when the connection resolves', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( listUrl )
			.reply( 200, {
				connections: [
					{
						id: 7,
						did: 'did:plc:viewer',
						handle: 'viewer.bsky.social',
						display_name: 'Viewer',
						avatar: null,
					},
				],
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( threadUrl )
			.query( true )
			.reply( 200, {
				thread: {
					type: 'not_found',
					uri: `at://${ DID }/app.bsky.feed.post/${ RKEY }`,
				},
			} );

		renderWithProvider( <AtmosphereThreadView connectionId={ 7 } did={ DID } rkey={ RKEY } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( screen.getAllByText( /Post unavailable/i ).length ).toBeGreaterThan( 0 )
		);
	} );
} );
