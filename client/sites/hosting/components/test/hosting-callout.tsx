/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { HostingActivationCallout } from '../hosting-callout';
import type { Site } from '@automattic/api-core';

const mockTransfer = vi.fn();
const mockSite = vi.fn();

vi.mock( '@automattic/api-queries', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/api-queries' ) >(
		'@automattic/api-queries'
	) ),
	siteLatestAtomicTransferQuery: ( siteId: number ) => ( {
		queryKey: [ 'transfer', siteId ],
		queryFn: () => mockTransfer(),
	} ),
	siteByIdQuery: ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: () => mockSite(),
	} ),
} ) );

vi.mock( 'calypso/state', () => ( { useDispatch: () => vi.fn() } ) );
vi.mock( '@automattic/calypso-router', () =>
	( ( m ) => ( { ...m, default: m } ) )( { replace: vi.fn(), show: vi.fn() } )
);
vi.mock( 'calypso/dashboard/sites/hosting-feature-list', () => ( { default: () => null } ) );
vi.mock( '../hosting-activation-button', () => ( {
	default: ( { text }: { text: string } ) => <button>{ text }</button>,
} ) );

const site = { ID: 1, slug: 'example.wordpress.com' } as Site;

const renderCallout = ( siteId = 1 ) => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render(
		<QueryClientProvider client={ client }>
			<HostingActivationCallout
				site={ { ...site, ID: siteId } as Site }
				path="/hosting-features/:site"
			/>
		</QueryClientProvider>,
		{
			wrapper: undefined,
		}
	);
};

const elapse = async ( ms: number ) => {
	await act( async () => {
		await vi.advanceTimersByTimeAsync( ms );
	} );
};

describe( 'HostingActivationCallout', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		mockSite.mockResolvedValue( { ID: 1, is_wpcom_atomic: false } );
	} );
	afterEach( () => vi.useRealTimers() );

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

	// SPA navigation keeps this component mounted, so a spent clock must not follow the user.
	it( 'starts a newly selected site on its own clock', async () => {
		mockTransfer.mockResolvedValue( { status: 'completed' } );
		const { rerender } = renderCallout( 1 );
		await elapse( 125_000 );
		expect( screen.getByText( 'Activate' ) ).toBeVisible();

		rerender(
			<QueryClientProvider
				client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
			>
				<HostingActivationCallout
					site={ { ...site, ID: 2 } as Site }
					path="/hosting-features/:site"
				/>
			</QueryClientProvider>
		);
		await elapse( 3000 );
		expect( screen.getByText( 'Activating…' ) ).toBeVisible();
	} );

	it( 'keeps the label honest for a transfer that failed outright', async () => {
		mockTransfer.mockResolvedValue( { status: 'error' } );
		renderCallout();

		await elapse( 3000 );
		expect( screen.getByText( 'Activate' ) ).toBeVisible();
	} );
} );
