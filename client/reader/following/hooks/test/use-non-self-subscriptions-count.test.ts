/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSiteSubscriptions as useReaderSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { useNonSelfSubscriptionsCount } from '../use-non-self-subscriptions-count';

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSiteSubscriptions: jest.fn(),
} ) );

const mockUseReaderSiteSubscriptions = useReaderSiteSubscriptions as jest.Mock;

const mockReaderSiteSubscriptions = ( {
	subscriptions = [],
	count = 0,
	isLoading = false,
}: {
	subscriptions?: { is_owner: boolean }[];
	count?: number;
	isLoading?: boolean;
} = {} ) => {
	mockUseReaderSiteSubscriptions.mockReturnValue( {
		subscriptions,
		count,
		isLoading,
	} );
};

describe( 'useNonSelfSubscriptionsCount', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return loading state when site subscriptions are loading', () => {
		mockReaderSiteSubscriptions( {
			isLoading: true,
		} );

		const { result } = renderHook( () => useNonSelfSubscriptionsCount() );

		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'should filter out self-owned blogs', () => {
		mockReaderSiteSubscriptions( {
			count: 2,
			subscriptions: [ { is_owner: true }, { is_owner: false } ],
		} );

		const { result } = renderHook( () => useNonSelfSubscriptionsCount() );

		expect( result.current.nonSelfSubscriptionsCount ).toBe( 1 );
	} );

	it( 'should return zero for nonSelfSubscriptionsCount when all subscriptions are self-owned', () => {
		mockReaderSiteSubscriptions( {
			count: 2,
			subscriptions: [ { is_owner: true }, { is_owner: true } ],
		} );

		const { result } = renderHook( () => useNonSelfSubscriptionsCount() );

		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should return zero for nonSelfSubscriptionsCount when blog count > 0 but no subscription data yet', () => {
		mockReaderSiteSubscriptions( {
			count: 1,
			subscriptions: [],
		} );

		const { result } = renderHook( () => useNonSelfSubscriptionsCount() );

		// We can't count what we haven't received yet — count stays at 0 until
		// the site subscriptions query resolves with detail data.
		expect( result.current.nonSelfSubscriptionsCount ).toBe( 0 );
	} );

	it( 'should count all subscriptions when none are self-owned', () => {
		mockReaderSiteSubscriptions( {
			count: 3,
			subscriptions: [ { is_owner: false }, { is_owner: false }, { is_owner: false } ],
		} );

		const { result } = renderHook( () => useNonSelfSubscriptionsCount() );

		expect( result.current.nonSelfSubscriptionsCount ).toBe( 3 );
	} );
} );
