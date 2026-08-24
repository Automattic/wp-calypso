/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useRefreshFollowingStreams } from '../use-refresh-following-streams';

const mockGetCurrentQueryArguments = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQueryClient: () => ( { invalidateQueries: mockInvalidateQueries } ),
} ) );

jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => ( {
	__esModule: true,
	default: ( state: unknown ) => mockGetCurrentQueryArguments( state ),
} ) );

// ── Helpers ───────────────────────────────────────────────────────────────────

const setPathname = ( pathname: string ) => {
	window.history.replaceState( null, '', pathname );
};

const getInvalidatedQueryKeyCalls = ( queryKeys: readonly ( readonly unknown[] )[] ) =>
	queryKeys.map( ( queryKey ) => [ { queryKey } ] );

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
	describe( 'follows refresh', () => {
		it( 'always invalidates follows regardless of current route', () => {
			setPathname( '/sites' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
				queryKey: getSiteSubscriptionsQueryKey(),
			} );
		} );

		it( 'invalidates follows when on /reader', () => {
			setPathname( '/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
				queryKey: getSiteSubscriptionsQueryKey(),
			} );
		} );

		it( 'invalidates follows when on /reader/on-this-day', () => {
			setPathname( '/reader/on-this-day' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
				queryKey: getSiteSubscriptionsQueryKey(),
			} );
		} );
	} );

	describe( 'stream refresh — routes with no stream refresh', () => {
		it( 'does not refresh any stream when not on reader feed or On This Day', () => {
			setPathname( '/sites' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [ getSiteSubscriptionsQueryKey() ] )
			);
		} );
	} );

	describe( 'stream refresh — reader feed', () => {
		it( 'invalidates the following stream on /reader', () => {
			setPathname( '/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'infinite', 'following' ],
				] )
			);
		} );

		it( 'invalidates the following stream with a locale-prefixed path', () => {
			setPathname( '/en/reader' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'infinite', 'following' ],
				] )
			);
		} );

		it( 'does not refresh the following stream on /reader/recent/:feedId', () => {
			setPathname( '/reader/recent/12345' );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [ getSiteSubscriptionsQueryKey() ] )
			);
		} );
	} );

	describe( 'stream refresh — On This Day', () => {
		it( 'invalidates the default on_this_day stream when query args are absent', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( null );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'on_this_day' ],
				] )
			);
		} );

		it( 'invalidates on_this_day with month and day from query args', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'on_this_day:3:14' ],
				] )
			);
		} );

		it( 'uses locale-stripped path for /en/reader/on-this-day', () => {
			setPathname( '/en/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'on_this_day:3:14' ],
				] )
			);
		} );

		it( 'uses base on_this_day key when month/day are invalid', () => {
			setPathname( '/reader/on-this-day' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '13', day: '1' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [
					getSiteSubscriptionsQueryKey(),
					[ 'read', 'stream', 'on_this_day' ],
				] )
			);
		} );

		it( 'does not treat /reader/on-this-day/extra as On This Day', () => {
			setPathname( '/reader/on-this-day/extra' );
			mockGetCurrentQueryArguments.mockReturnValue( { month: '3', day: '14' } );
			const { result } = renderHookWithProvider( () => useRefreshFollowingStreams() );
			result.current();
			expect( mockInvalidateQueries.mock.calls ).toEqual(
				getInvalidatedQueryKeyCalls( [ getSiteSubscriptionsQueryKey() ] )
			);
		} );
	} );
} );
