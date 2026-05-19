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
	// later pages may still be in flight. `hasLoadedAllSubscriptions` is the
	// signal callers should use when they need an exact count.
	describe( 'hasLoadedAllSubscriptions', () => {
		const setup = ( siteQueryOverrides: Record< string, unknown > ) => {
			( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
				data: { blogs: 250 },
				isLoading: false,
			} );
			( SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock ).mockReturnValue( {
				data: { subscriptions: [ { is_owner: true } ] },
				isLoading: false,
				hasNextPage: false,
				isFetching: false,
				isFetchingNextPage: false,
				refetch: jest.fn(),
				...siteQueryOverrides,
			} );
			return renderHook( () => useSiteSubscriptions() );
		};

		it( 'is true once page 1 has loaded and no more pages are queued', () => {
			const { result } = setup( {} );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( true );
		} );

		it( 'is false while later pages are still queued (hasNextPage)', () => {
			const { result } = setup( { hasNextPage: true } );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false while a follow-up page is in flight (isFetchingNextPage)', () => {
			const { result } = setup( { isFetchingNextPage: true } );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false during any background refetch (isFetching)', () => {
			const { result } = setup( { isFetching: true } );

			expect( result.current.hasLoadedAllSubscriptions ).toBe( false );
		} );

		it( 'is false until page 1 itself has loaded', () => {
			( SubscriptionManager.useSubscriptionsCountQuery as jest.Mock ).mockReturnValue( {
				data: { blogs: 250 },
				isLoading: false,
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
