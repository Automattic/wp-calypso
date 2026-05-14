/**
 * @jest-environment jsdom
 */

import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useRefreshFollowingStreams } from '../use-refresh-following-streams';

// ── Preferences ───────────────────────────────────────────────────────────────

const mockGetPreference = jest.fn();

jest.mock( 'calypso/state/preferences/selectors', () => ( {
	getPreference: ( ...args: unknown[] ) => mockGetPreference( ...args ),
	hasReceivedRemotePreferences: jest.fn().mockReturnValue( true ),
} ) );

// ── Follows ───────────────────────────────────────────────────────────────────

const mockRequestFollows = jest.fn( () => ( { type: 'READER_FOLLOWS_REQUEST' } ) );

jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: () => mockRequestFollows(),
} ) );

// ── Stream actions ────────────────────────────────────────────────────────────

const mockClearStream = jest.fn( () => ( { type: 'READER_CLEAR_STREAM' } ) );
const mockRequestPage = jest.fn( () => ( { type: 'READER_REQUEST_PAGE' } ) );
const mockRequestPaginatedStream = jest.fn( () => ( { type: 'READER_REQUEST_PAGINATED_STREAM' } ) );

jest.mock( 'calypso/state/reader/streams/actions', () => ( {
	clearStream: ( ...args: unknown[] ) => mockClearStream( ...args ),
	requestPage: ( ...args: unknown[] ) => mockRequestPage( ...args ),
	requestPaginatedStream: ( ...args: unknown[] ) => mockRequestPaginatedStream( ...args ),
} ) );

// ── Helpers ───────────────────────────────────────────────────────────────────

const setPathname = ( pathname: string ) => {
	Object.defineProperty( window, 'location', {
		value: { ...window.location, pathname },
		writable: true,
	} );
};

beforeEach( () => {
	jest.clearAllMocks();
	// Default: not on /reader.
	setPathname( '/sites' );
	// Default: 'stream' view (null → DEFAULT_VIEW fallback).
	mockGetPreference.mockReturnValue( null );
} );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe( 'useRefreshFollowingStreams', () => {
	describe( 'requestFollows', () => {
		it( 'always calls requestFollows regardless of current route', () => {
			setPathname( '/sites' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestFollows ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls requestFollows even when on /reader', () => {
			setPathname( '/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestFollows ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'stream refresh — not on /reader', () => {
		it( 'does not refresh any stream when not on /reader', () => {
			setPathname( '/sites' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).not.toHaveBeenCalled();
			expect( mockRequestPage ).not.toHaveBeenCalled();
			expect( mockRequestPaginatedStream ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stream refresh — on /reader, stream view (default)', () => {
		it( 'clears and re-requests the following stream on /reader', () => {
			setPathname( '/reader' );
			mockGetPreference.mockReturnValue( null ); // null → 'stream' default
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'following' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'following' } );
		} );

		it( 'clears and re-requests the following stream when preference is explicitly "stream"', () => {
			setPathname( '/reader' );
			mockGetPreference.mockReturnValue( 'stream' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'following' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'following' } );
			expect( mockRequestPaginatedStream ).not.toHaveBeenCalled();
		} );

		it( 'does not request recent stream when in stream view', () => {
			setPathname( '/reader' );
			mockGetPreference.mockReturnValue( 'stream' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestPaginatedStream ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stream refresh — on /reader, recent view', () => {
		it( 'requests the paginated recent stream on /reader when view is "recent"', () => {
			setPathname( '/reader' );
			mockGetPreference.mockReturnValue( 'recent' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestPaginatedStream ).toHaveBeenCalledWith( {
				streamKey: 'recent',
				page: 1,
				perPage: 10,
			} );
		} );

		it( 'does not clear the following stream when in recent view', () => {
			setPathname( '/reader' );
			mockGetPreference.mockReturnValue( 'recent' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).not.toHaveBeenCalled();
			expect( mockRequestPage ).not.toHaveBeenCalled();
		} );

		it( 'requests recent stream when on /reader/recent sub-path', () => {
			setPathname( '/reader/recent/12345' );
			mockGetPreference.mockReturnValue( 'recent' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestPaginatedStream ).toHaveBeenCalledWith( {
				streamKey: 'recent',
				page: 1,
				perPage: 10,
			} );
		} );
	} );
} );
