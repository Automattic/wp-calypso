/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import TrackPurchasePageView from '..';

const mockRecordTracksEvent = jest.fn( () => ( { type: 'TEST_TRACKS_EVENT' } ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const PURCHASE_ID = 12345;
const eventName = 'calypso_testtracking_purchase_view';

function renderTracker( { purchaseId = PURCHASE_ID, eventName: name = eventName } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	const store = createReduxStore( {}, ( state ) => state );
	const utils = render(
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<TrackPurchasePageView purchaseId={ purchaseId } eventName={ name } />
			</QueryClientProvider>
		</ReduxProvider>
	);
	return {
		...utils,
		rerenderWith: ( props: { purchaseId?: number; eventName?: string } ) =>
			utils.rerender(
				<ReduxProvider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<TrackPurchasePageView
							purchaseId={ props.purchaseId ?? purchaseId }
							eventName={ props.eventName ?? name }
						/>
					</QueryClientProvider>
				</ReduxProvider>
			),
	};
}

function mockPurchase( purchaseId: number, purchase: Record< string, unknown > | null ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.2/upgrades/${ purchaseId }` )
		.reply( 200, purchase );
}

beforeEach( () => {
	jest.clearAllMocks();
	nock.cleanAll();
} );

describe( 'TrackPurchasePageView', () => {
	test( 'should render nothing', () => {
		mockPurchase( PURCHASE_ID, { ID: PURCHASE_ID, product_slug: 'my-fancy-product' } );
		const { container } = renderTracker();
		expect( container.innerHTML ).toEqual( '' );
	} );

	test( 'should track once the purchase has loaded', async () => {
		mockPurchase( PURCHASE_ID, { ID: PURCHASE_ID, product_slug: 'my-fancy-product' } );
		renderTracker();

		expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 0 );

		await waitFor( () => expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 ) );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( eventName, {
			product_slug: 'my-fancy-product',
		} );
	} );

	test( 'should not track if the purchase has no product slug', async () => {
		mockPurchase( PURCHASE_ID, { ID: PURCHASE_ID } );
		renderTracker();

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'should only track once while the purchase and event name are unchanged', async () => {
		mockPurchase( PURCHASE_ID, { ID: PURCHASE_ID, product_slug: 'my-fancy-product' } );
		const { rerenderWith } = renderTracker();

		await waitFor( () => expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 ) );

		rerenderWith( {} );
		rerenderWith( {} );

		expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should track again when the event name changes', async () => {
		mockPurchase( PURCHASE_ID, { ID: PURCHASE_ID, product_slug: 'my-fancy-product' } );
		const { rerenderWith } = renderTracker();

		await waitFor( () => expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 ) );

		rerenderWith( { eventName: 'new-tracking-slug' } );

		expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( mockRecordTracksEvent ).toHaveBeenLastCalledWith( 'new-tracking-slug', {
			product_slug: 'my-fancy-product',
		} );
	} );
} );
