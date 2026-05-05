/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { FediverseOauthCallbackView } from '../fediverse-oauth-callback-view';
import { saveOauthState } from '../oauth-state';
import { getAccountUrl, getConnectUrl } from '../route';
import type React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

// Mock analytics — recordReaderTracksEvent must return a plain Redux action.
const mockRecordReaderTracksEvent = jest.fn( () => ( { type: 'TEST_TRACKS_EVENT' } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Mock useDispatch from calypso/state so Redux store is not required.
const mockDispatch = jest.fn( ( action ) => action );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

// Mock i18n-calypso to avoid the interpolate-components dependency chain.
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

// Mock @automattic/api-queries entirely.
const mockMutate = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	useCompleteFediverseConnectionMutation: () => ( { mutate: mockMutate } ),
} ) );

// Mock @wordpress/components to avoid the full package import.
jest.mock( '@wordpress/components', () => ( {
	Spinner: () => null,
} ) );

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function renderView( query: { code?: string; state?: string; error?: string } ) {
	const client = makeClient();
	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
	);
	return render( <FediverseOauthCallbackView query={ query } />, { wrapper: Wrapper } );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( 'FediverseOauthCallbackView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
		mockRecordReaderTracksEvent.mockClear();
		mockDispatch.mockClear();
		mockMutate.mockReset();
		window.sessionStorage.clear();
	} );

	// -------------------------------------------------------------------------
	// 1. Happy path: code+state match → mutation succeeds → redirect to timeline
	// -------------------------------------------------------------------------

	it( 'calls complete mutation and redirects to the new connection timeline on success', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );

		mockMutate.mockImplementation(
			( _params: unknown, { onSuccess }: { onSuccess: ( data: { id: number } ) => void } ) => {
				onSuccess( { id: 99 } );
			}
		);

		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( getAccountUrl( 99, 'timeline' ) )
		);
		expect( window.sessionStorage.getItem( 'reader-fediverse-oauth-state' ) ).toBeNull();
	} );

	it( 'dispatches CONNECT_COMPLETED analytics on success', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );

		mockMutate.mockImplementation(
			( _params: unknown, { onSuccess }: { onSuccess: ( data: { id: number } ) => void } ) => {
				onSuccess( { id: 99 } );
			}
		);

		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'TEST_TRACKS_EVENT' } );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_fediverse_connect_completed',
			expect.objectContaining( { connection_id: 99 } )
		);
	} );

	it( 'fires the mutation only once (ref guard prevents double-invoke)', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );
		let callCount = 0;

		mockMutate.mockImplementation(
			( _params: unknown, { onSuccess }: { onSuccess: ( data: { id: number } ) => void } ) => {
				callCount++;
				onSuccess( { id: 99 } );
			}
		);

		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( callCount ).toBe( 1 );
	} );

	// -------------------------------------------------------------------------
	// 2. Provider error (?error=access_denied) → redirect to connect page
	// -------------------------------------------------------------------------

	it( 'redirects to connect page with error when provider returns ?error', async () => {
		renderView( { error: 'access_denied' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=access_denied` )
		);
		expect( mockMutate ).not.toHaveBeenCalled();
	} );

	it( 'dispatches CONNECT_FAILED analytics for provider error', async () => {
		renderView( { error: 'access_denied' } );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_fediverse_connect_failed',
			expect.objectContaining( { step: 'authorize', error: 'access_denied' } )
		);
	} );

	// -------------------------------------------------------------------------
	// 3. Missing code parameter → redirect with missing_params
	// -------------------------------------------------------------------------

	it( 'redirects with missing_params error when code is absent', async () => {
		renderView( { state: 'abc' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=missing_params` )
		);
	} );

	it( 'redirects with missing_params error when state is absent', async () => {
		renderView( { code: 'xyz' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=missing_params` )
		);
	} );

	// -------------------------------------------------------------------------
	// 4. State mismatch → redirect with state_mismatch, sessionStorage cleared
	// -------------------------------------------------------------------------

	it( 'redirects with state_mismatch error when stored state differs', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );

		renderView( { state: 'different', code: 'xyz' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=state_mismatch` )
		);
		expect( window.sessionStorage.getItem( 'reader-fediverse-oauth-state' ) ).toBeNull();
	} );

	it( 'redirects with state_mismatch when no state is stored at all', async () => {
		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=state_mismatch` )
		);
	} );

	// -------------------------------------------------------------------------
	// 5. Mutation failure → redirect with error kind, sessionStorage cleared
	// -------------------------------------------------------------------------

	it( 'redirects with error kind and clears storage when complete mutation fails', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );

		mockMutate.mockImplementation(
			( _params: unknown, { onError }: { onError: ( err: { kind: string } ) => void } ) => {
				onError( { kind: 'auth_failed' } );
			}
		);

		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( `${ getConnectUrl() }?error=auth_failed` )
		);
		expect( window.sessionStorage.getItem( 'reader-fediverse-oauth-state' ) ).toBeNull();
	} );

	it( 'dispatches CONNECT_FAILED analytics for mutation error', async () => {
		saveOauthState( { state: 'abc', blog_id: 123 } );

		mockMutate.mockImplementation(
			( _params: unknown, { onError }: { onError: ( err: { kind: string } ) => void } ) => {
				onError( { kind: 'auth_failed' } );
			}
		);

		renderView( { state: 'abc', code: 'xyz' } );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_fediverse_connect_failed',
			expect.objectContaining( { step: 'complete', error: 'auth_failed' } )
		);
	} );
} );
