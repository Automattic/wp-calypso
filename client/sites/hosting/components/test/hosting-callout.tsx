/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import { HostingActivationCallout } from '../hosting-callout';
import type { Site } from '@automattic/api-core';

const mockTransfer = jest.fn();
const mockSite = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteLatestAtomicTransferQuery: ( siteId: number ) => ( {
		queryKey: [ 'transfer', siteId ],
		queryFn: () => mockTransfer(),
	} ),
	siteByIdQuery: ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: () => mockSite(),
	} ),
} ) );

jest.mock( 'calypso/state', () => ( { useDispatch: () => jest.fn() } ) );
jest.mock( '@automattic/calypso-router', () => ( { replace: jest.fn(), show: jest.fn() } ) );
jest.mock( 'calypso/dashboard/sites/hosting-feature-list', () => () => null );
jest.mock( '../hosting-activation-button', () => ( { text }: { text: string } ) => (
	<button>{ text }</button>
) );

const site = { ID: 1, slug: 'example.wordpress.com' } as Site;

const renderCallout = () =>
	render(
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<HostingActivationCallout site={ site } path="/hosting-features/:site" />
		</QueryClientProvider>
	);

const elapse = async ( ms: number ) => {
	for ( let elapsed = 0; elapsed < ms; elapsed += 1000 ) {
		await act( async () => {
			jest.advanceTimersByTime( 1000 );
			await Promise.resolve();
		} );
	}
};

describe( 'HostingActivationCallout', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockSite.mockResolvedValue( { ID: 1, is_wpcom_atomic: false } );
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'shows the transfer as running while it is in progress', async () => {
		mockTransfer.mockResolvedValue( { status: 'active' } );
		renderCallout();

		await elapse( 2000 );
		expect( await screen.findByText( 'Activating…' ) ).toBeVisible();
	} );

	// The trap: `completed` pins the label true, so a site that never turns Atomic held
	// "Activating…" and polled every 2s for the life of the tab.
	it( 'stops claiming activation when the site never becomes Atomic', async () => {
		mockTransfer.mockResolvedValue( { status: 'completed' } );
		renderCallout();

		await elapse( 5000 );
		expect( screen.getByText( 'Activating…' ) ).toBeVisible();

		await elapse( 125_000 );
		expect( screen.getByText( 'Activate' ) ).toBeVisible();
	} );

	it( 'stops polling the site once the wait has run out', async () => {
		mockTransfer.mockResolvedValue( { status: 'completed' } );
		renderCallout();

		await elapse( 125_000 );
		const settled = mockSite.mock.calls.length;

		await elapse( 60_000 );
		expect( mockSite.mock.calls.length ).toBe( settled );
	} );

	it( 'keeps the label honest for a transfer that failed outright', async () => {
		mockTransfer.mockResolvedValue( { status: 'error' } );
		renderCallout();

		await elapse( 3000 );
		expect( screen.getByText( 'Activate' ) ).toBeVisible();
	} );
} );
