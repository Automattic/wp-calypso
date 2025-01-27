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
} );
