/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
	normalizeNoticeRecords,
	noticesVisibilityQueryKey,
	useNoticeRecordQuery,
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
			normalizeNoticeRecords( { pricing_grid: true, tier_upgrade: true } )
		);
	} );

	/**
	 * The cache holds records, and every reader relies on that shape. The patch that hides the
	 * grid before the POST lands must keep it.
	 */
	it( 'hides the grid in the cache as a record, before the write lands', async () => {
		const { result: dismiss } = renderHook( () => useDismissPricingGrid( SITE_ID ), { wrapper } );
		const { result: all } = renderHook( () => useNoticesVisibilityQuery( SITE_ID ), { wrapper } );
		const { result: record } = renderHook( () => useNoticeRecordQuery( SITE_ID, 'pricing_grid' ), {
			wrapper,
		} );

		act( () => dismiss.current() );

		expect( mockRecordDismissal ).toHaveBeenCalled();
		await waitFor( () => expect( all.current.data?.pricing_grid ).toBe( false ) );
		expect( all.current.data?.tier_upgrade ).toBe( true );
		expect( record.current.data ).toEqual( {
			show: false,
			status: null,
			postponed_count: 0,
			next_show_at: null,
		} );
	} );
} );
