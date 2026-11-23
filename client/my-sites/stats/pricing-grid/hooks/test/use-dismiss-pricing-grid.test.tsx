/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
	normalizeNoticesVisibility,
	noticesVisibilityQueryKey,
	useNoticesVisibilityQuery,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import useDismissPricingGrid from '../use-dismiss-pricing-grid';

const mockRecordDismissal = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutateAsync: mockRecordDismissal } ),
} ) );

const SITE_ID = 1;

describe( 'useDismissPricingGrid', () => {
	let client: QueryClient;
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
	);

	beforeEach( () => {
		jest.clearAllMocks();
		mockRecordDismissal.mockReturnValue( new Promise( () => {} ) );
		client = new QueryClient();
		client.setQueryData(
			noticesVisibilityQueryKey( SITE_ID ),
			normalizeNoticesVisibility( { pricing_grid: true, tier_upgrade: true } )
		);
	} );

	it( 'hides the grid in the cache before the write lands', async () => {
		const { result: dismiss } = renderHook( () => useDismissPricingGrid( SITE_ID ), { wrapper } );
		const { result: all } = renderHook( () => useNoticesVisibilityQuery( SITE_ID ), { wrapper } );

		act( () => dismiss.current() );

		expect( mockRecordDismissal ).toHaveBeenCalled();
		await waitFor( () => expect( all.current.data?.pricing_grid ).toBe( false ) );
		expect( all.current.data?.tier_upgrade ).toBe( true );
	} );
} );
