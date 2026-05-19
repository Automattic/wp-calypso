/**
 * @jest-environment jsdom
 */
import { SubscriptionManager } from '@automattic/data-stores';
import { renderHook } from '@testing-library/react';
import { useSiteSubscriptions } from '../use-site-subscriptions';

jest.mock( '@automattic/data-stores', () => ( {
	SubscriptionManager: {
		useSubscriptionsCountQuery: jest.fn(),
		useSiteSubscriptionsQuery: jest.fn(),
	},
} ) );

describe( 'useSiteSubscriptions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return loading state when either query is loading', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: true,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'should return false for hasNonSelfSubscriptions when blog count is 0', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 0 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.hasNonSelfSubscriptions ).toBe( false );
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should filter out self-owned blogs when calculating hasNonSelfSubscriptions', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 2 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: {
				subscriptions: [ { is_owner: true }, { is_owner: false } ],
			},
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.hasNonSelfSubscriptions ).toBe( true );
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 1 );
	} );

	it( 'should return false for hasNonSelfSubscriptions when all subscriptions are self-owned', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 2 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: {
				subscriptions: [ { is_owner: true }, { is_owner: true } ],
			},
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.hasNonSelfSubscriptions ).toBe( false );
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should return true for hasNonSelfSubscriptions when blog count > 0 but no subscription data yet', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 1 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.hasNonSelfSubscriptions ).toBe( true );
		// We can't count what we haven't received yet — count stays at 0 until
		// the site subscriptions query resolves with detail data.
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should count all subscriptions when none are self-owned', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 3 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: {
				subscriptions: [ { is_owner: false }, { is_owner: false }, { is_owner: false } ],
			},
			isLoading: false,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.nonSelfSubscriptionsCount ).toBe( 3 );
	} );

	it( 'should return 0 for nonSelfSubscriptionsCount while site subscriptions data is undefined (loading)', () => {
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 5 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: undefined,
			isLoading: true,
			refetch: jest.fn(),
		} );

		const { result } = renderHook( () => useSiteSubscriptions() );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should call refetch when blog count changes from 0 to positive', () => {
		const refetchMock = jest.fn();
		( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
			data: { blogs: 1 },
			isLoading: false,
		} );
		( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: false,
			refetch: refetchMock,
		} );

		renderHook( () => useSiteSubscriptions() );

		expect( refetchMock ).toHaveBeenCalled();
	} );

	// The underlying site-subscriptions query is an infinite query that
	// auto-paginates; `isLoading` flips false after page 1 arrives even though
	// later pages may still be in flight. Calypso also persists successful
	// React Query results across sessions by default, so on mount both
	// queries can hydrate with previously-cached data before a fresh fetch
	// has had a chance to run. `hasLoadedAllSubscriptions` is the signal
	// callers should use when they need an exact count — it gates on both
	// queries having actually fetched since the hook mounted.
	describe( 'hasLoadedAllSubscriptions', () => {
		// Mocks both queries at "hot cache" defaults (data present, not
		// fetching) and exposes setters so tests can drive each one through
		// its mount-time fetch lifecycle.
		const setupWithLifecycle = ( {
			countOverrides = {},
			siteOverrides = {},
		}: {
			countOverrides?: Record< string, unknown >;
			siteOverrides?: Record< string, unknown >;
		} = {} ) => {
			const countQuery = {
				data: { blogs: 250 },
				isLoading: false,
				isFetching: false,
				...countOverrides,
			};
			const siteQuery = {
				data: { subscriptions: [ { is_owner: true } ] },
				isLoading: false,
				hasNextPage: false,
				isFetching: false,
				isFetchingNextPage: false,
				refetch: jest.fn(),
				...siteOverrides,
			};
			( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockImplementation(
				() => countQuery
			);
			( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockImplementation(
				() => siteQuery
			);
			const renderResult = renderHook( () => useSiteSubscriptions() );
			const setCountQueryState = ( next: Record< string, unknown > ) => {
				Object.assign( countQuery, next );
				renderResult.rerender();
			};
			const setSiteQueryState = ( next: Record< string, unknown > ) => {
				Object.assign( siteQuery, next );
				renderResult.rerender();
			};
			return { ...renderResult, setCountQueryState, setSiteQueryState };
		};

		it( 'stays false on first render against a hot cache (no fetch observed since mount yet)', () => {
			// Both queries look "loaded" but the hook has never seen a fetch cycle —
			// this is the warm/persisted-cache mount that would otherwise let a
			// count-based snapshot capture stale data before the mount refetch fires.
			const { result } = setupWithLifecycle();

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'becomes true once a fetch cycle on the site-subscriptions query has been observed end-to-end', () => {
			const { result, setSiteQueryState } = setupWithLifecycle();

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );

			// On-mount refetch starts: isFetching flips true.
			setSiteQueryState( { isFetching: true } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );

			// Refetch completes: isFetching flips false, ref has captured the
			// transition, so we're now genuinely loaded.
			setSiteQueryState( { isFetching: false } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );
		} );

		it( 'also tracks the count query — a count refetch alone is enough to satisfy the mount-gate', () => {
			// Critical for the persisted `{ blogs: 0 }` case: with no site-subs
			// refetch scheduled (the hook only triggers one when blogCount > 0),
			// the count query's refetch must still satisfy the mount gate so
			// that once it confirms the zero, the hook can declare loaded.
			const { result, setCountQueryState } = setupWithLifecycle( {
				countOverrides: { data: { blogs: 0 } },
				siteOverrides: { data: { subscriptions: [] } },
			} );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );

			setCountQueryState( { isFetching: true } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );

			setCountQueryState( { isFetching: false } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );
		} );

		it( 'stays false while the count query is mid-refetch even though every other flag looks loaded', () => {
			// Mirrors the persisted-zero hot-cache case: a stale `{ blogs: 0 }`
			// is in the cache, the count query is refetching to get the real
			// value, and we must not declare loaded yet — the real count might
			// be much higher, which would change eligibility.
			const { result } = setupWithLifecycle( {
				countOverrides: { data: { blogs: 0 }, isFetching: true },
				siteOverrides: { data: { subscriptions: [] } },
			} );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false while later pages are still queued (hasNextPage)', () => {
			// Drive a complete fetch first so the mount-gate is satisfied, then
			// flip hasNextPage true — pagination should keep loaded=false.
			const { result, setSiteQueryState } = setupWithLifecycle( {
				siteOverrides: { isFetching: true },
			} );

			setSiteQueryState( { isFetching: false } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );

			setSiteQueryState( { hasNextPage: true } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false while a follow-up page is in flight (isFetchingNextPage)', () => {
			const { result, setSiteQueryState } = setupWithLifecycle( {
				siteOverrides: { isFetching: true },
			} );

			setSiteQueryState( { isFetching: false } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );

			setSiteQueryState( { isFetchingNextPage: true } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false during any background refetch (isFetching)', () => {
			const { result, setSiteQueryState } = setupWithLifecycle( {
				siteOverrides: { isFetching: true },
			} );

			setSiteQueryState( { isFetching: false } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );

			setSiteQueryState( { isFetching: true } );
			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false until page 1 itself has loaded', () => {
			( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
				data: { blogs: 250 },
				isLoading: false,
				isFetching: false,
			} );
			( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
				data: undefined,
				isLoading: true,
				hasNextPage: false,
				isFetching: true,
				isFetchingNextPage: false,
				refetch: jest.fn(),
			} );

			const { result } = renderHook( () => useSiteSubscriptions() );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );
	} );
} );
