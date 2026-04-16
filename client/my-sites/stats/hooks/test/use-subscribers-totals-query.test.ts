/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useSubscribersTotalsQueries from '../use-subscribers-totals-query';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( () => false ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueries: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

jest.mock( 'calypso/state/stats/lists/utils', () => ( {
	parseAvatar: jest.fn( () => '' ),
} ) );

describe( 'useSubscribersTotalsQueries', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps loading state while subscriber queries are still pending', () => {
		const { useQueries } = jest.requireMock( '@tanstack/react-query' ) as {
			useQueries: jest.Mock;
		};

		useQueries.mockReturnValue( [
			{ data: {}, isPending: false, isLoading: false, isError: false },
			{
				data: {
					total_subscribers: 3,
					paid_subscribers: 1,
					social_followers: 0,
				},
				isPending: false,
				isLoading: false,
				isError: false,
			},
			{ data: undefined, isPending: true, isLoading: false, isError: false },
			{ data: undefined, isPending: false, isLoading: false, isError: false },
		] );

		const { result } = renderHook( () => useSubscribersTotalsQueries( 123 ) );

		expect( result.current.isLoading ).toBe( true );
	} );
} );
