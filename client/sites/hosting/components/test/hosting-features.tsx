/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import HostingFeatures from '../hosting-features';

const mockDispatch = jest.fn();
let mockTransferStatus = 'completed';
let mockIsSiteAtomic = false;
let mockSiteId = 1;

jest.mock( 'calypso/landing/stepper/hooks/use-site-transfer-status-query', () => ( {
	useSiteTransferStatusQuery: () => ( {
		data: { status: mockTransferStatus, isTransferring: mockTransferStatus === 'active' },
	} ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => () => mockIsSiteAtomic );
jest.mock( 'calypso/state/selectors/site-has-feature', () => () => true );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => mockSiteId,
	getSelectedSite: () => ( { plan: { expired: false } } ),
} ) );
jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: ( siteId: number ) => ( { type: 'REQUEST_SITE', siteId } ),
} ) );
jest.mock( '@automattic/calypso-router', () => ( { replace: jest.fn() } ) );
jest.mock( '../hosting-activation-button', () => () => null );
jest.mock( 'calypso/components/inline-support-link', () => () => null );

const elapse = async ( ms: number ) => {
	await act( async () => {
		await jest.advanceTimersByTimeAsync( ms );
	} );
};

const requestSiteCalls = () =>
	mockDispatch.mock.calls.filter( ( [ action ] ) => action?.type === 'REQUEST_SITE' ).length;

describe( 'HostingFeatures', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockTransferStatus = 'completed';
		mockIsSiteAtomic = false;
		mockSiteId = 1;
	} );
	afterEach( () => jest.useRealTimers() );

	// The bug: Redux owns the redirect's condition and nothing here refreshed it, so a successful
	// transfer parked the user on the activating spinner until they reloaded by hand.
	it( 'refreshes the Redux site once the transfer completes', async () => {
		render( <HostingFeatures /> );
		await elapse( 1000 );
		expect( requestSiteCalls() ).toBeGreaterThan( 0 );
	} );

	it( 'does not refresh while the transfer is still running', async () => {
		mockTransferStatus = 'active';
		render( <HostingFeatures /> );
		await elapse( 10_000 );
		expect( requestSiteCalls() ).toBe( 0 );
	} );

	it( 'stops refreshing once the site reports as Atomic', async () => {
		mockIsSiteAtomic = true;
		render( <HostingFeatures /> );
		await elapse( 30_000 );
		expect( requestSiteCalls() ).toBe( 0 );
	} );

	it( 'gives the activation wait an ending instead of spinning forever', async () => {
		render( <HostingFeatures /> );
		await elapse( 5000 );
		expect( screen.getByText( 'Activating hosting features' ) ).toBeVisible();

		await elapse( 125_000 );
		expect( screen.getByText( 'Activation is taking longer than expected' ) ).toBeVisible();
		expect( screen.queryByText( 'Activating hosting features' ) ).not.toBeInTheDocument();
	} );

	// The page stays mounted across a site switch, so a spent clock must not follow the user.
	it( 'starts a newly selected site on its own clock', async () => {
		const { rerender } = render( <HostingFeatures /> );
		await elapse( 125_000 );
		expect( screen.getByText( 'Activation is taking longer than expected' ) ).toBeVisible();

		mockSiteId = 2;
		rerender( <HostingFeatures /> );
		await elapse( 1000 );
		expect( screen.getByText( 'Activating hosting features' ) ).toBeVisible();
		expect(
			screen.queryByText( 'Activation is taking longer than expected' )
		).not.toBeInTheDocument();
	} );

	it( 'stops refreshing the site once the wait has run out', async () => {
		render( <HostingFeatures /> );
		await elapse( 125_000 );
		const settled = requestSiteCalls();

		await elapse( 60_000 );
		expect( requestSiteCalls() ).toBe( settled );
	} );
} );
