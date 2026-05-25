/**
 * @jest-environment jsdom
 */

import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useRefreshFollowingStreams } from '../use-refresh-following-streams';

const mockGetCurrentQueryArguments = jest.fn();

jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => ( {
	__esModule: true,
	default: ( state: unknown ) => mockGetCurrentQueryArguments( state ),
} ) );

// ── Follows ───────────────────────────────────────────────────────────────────

const mockRequestFollows = jest.fn( () => ( { type: 'READER_FOLLOWS_REQUEST' } ) );

jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: () => mockRequestFollows(),
} ) );

// ── Stream actions ────────────────────────────────────────────────────────────

const mockClearStream = jest.fn().mockReturnValue( { type: 'READER_CLEAR_STREAM' } );
const mockRequestPage = jest.fn().mockReturnValue( { type: 'READER_REQUEST_PAGE' } );

jest.mock( 'calypso/state/reader/streams/actions', () => ( {
	clearStream: ( payload: { streamKey: string } ) => mockClearStream( payload ),
	requestPage: ( payload: { streamKey: string } ) => mockRequestPage( payload ),
} ) );

// ── Helpers ───────────────────────────────────────────────────────────────────

const setPathname = ( pathname: string ) => {
	window.history.replaceState( null, '', pathname );
};

let locationHrefBeforeTest: string;

beforeEach( () => {
	jest.clearAllMocks();
	locationHrefBeforeTest = window.location.href;
	setPathname( '/sites' );
	mockGetCurrentQueryArguments.mockReturnValue( null );
} );

afterEach( () => {
	window.history.replaceState( null, '', locationHrefBeforeTest );
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

		it( 'calls requestFollows when on /reader', () => {
			setPathname( '/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestFollows ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls requestFollows when on /reader/on-this-day', () => {
			setPathname( '/reader/on-this-day' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockRequestFollows ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'stream refresh — routes with no stream refresh', () => {
		it( 'does not refresh any stream when not on reader feed or On This Day', () => {
			setPathname( '/sites' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).not.toHaveBeenCalled();
			expect( mockRequestPage ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stream refresh — reader feed', () => {
		it( 'clears and re-requests the following stream on /reader', () => {
			setPathname( '/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'following' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'following' } );
		} );

		it( 'clears and re-requests the following stream with a locale-prefixed path', () => {
			setPathname( '/en/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'following' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'following' } );
		} );

		it( 'does not refresh the following stream on /reader/recent/:feedId', () => {
			setPathname( '/reader/recent/12345' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).not.toHaveBeenCalled();
			expect( mockRequestPage ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stream refresh — On This Day', () => {
		it( 'refreshes the default on_this_day stream when query args are absent', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( null );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'on_this_day' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'on_this_day' } );
		} );

		it( 'refreshes on_this_day with month and day from query args', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'on_this_day:3:14' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'on_this_day:3:14' } );
		} );

		it( 'uses locale-stripped path for /en/reader/on-this-day', () => {
			setPathname( '/en/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'on_this_day:3:14' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'on_this_day:3:14' } );
		} );

		it( 'uses base on_this_day key when month/day are invalid', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '13', day: '1' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).toHaveBeenCalledWith( { streamKey: 'on_this_day' } );
			expect( mockRequestPage ).toHaveBeenCalledWith( { streamKey: 'on_this_day' } );
		} );

		it( 'does not treat /reader/on-this-day/extra as On This Day', () => {
			setPathname( '/reader/on-this-day/extra' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockClearStream ).not.toHaveBeenCalled();
			expect( mockRequestPage ).not.toHaveBeenCalled();
		} );
	} );
} );
