/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AtmosphereLandingView } from '../atmosphere-landing-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const connectionsUrl = '/wpcom/v2/reader/atmosphere/connections';

describe( 'AtmosphereLandingView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'redirects to /connect when there are no connections', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( connectionsUrl )
			.reply( 200, { connections: [] } );
		renderWithProvider( <AtmosphereLandingView /> );
		await screen.findByRole( 'status' );
		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere/connect' )
		);
	} );

	it( 'redirects to /:firstId/timeline when connections exist', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( connectionsUrl )
			.reply( 200, {
				connections: [
					{ id: 7, did: 'did:plc:7', handle: 'a.bsky.social', display_name: 'Alice', avatar: null },
				],
			} );
		renderWithProvider( <AtmosphereLandingView /> );
		await screen.findByRole( 'status' );
		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' )
		);
	} );

	it( 'shows an error with a retry button when the connections query errors', async () => {
		nock( 'https://public-api.wordpress.com' ).get( connectionsUrl ).reply( 500 );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		renderWithProvider( <AtmosphereLandingView />, { queryClient } );

		await screen.findByRole( 'alert' );
		expect( screen.getByRole( 'button', { name: /try again/i } ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();
	} );
} );
