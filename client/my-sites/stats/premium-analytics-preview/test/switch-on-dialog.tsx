/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SwitchOnDialog from '../switch-on-dialog';

// The flag store is created inside the factory and parked on `globalThis`: modules read config
// while they are being imported, before any module-scope `const` here exists.
jest.mock( '@automattic/calypso-config', () => {
	const flags: Record< string, boolean > = {};
	( globalThis as Record< string, unknown > ).__switchOnDialogTestFlags = flags;
	const isEnabled = ( flag: string ) => !! flags[ flag ];
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const mockFlags = () =>
	( globalThis as Record< string, unknown > ).__switchOnDialogTestFlags as Record<
		string,
		boolean
	>;

const mockSetQueryData = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { setQueryData: mockSetQueryData } ),
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockEnablePreview = jest.fn();
let mockIsEnabling = false;
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutateAsync: mockEnablePreview, isPending: mockIsEnabling } ),
} ) );

const DASHBOARD_URL =
	'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';

const renderDialog = () => {
	const onClose = jest.fn();
	render( <SwitchOnDialog siteId={ 123 } dashboardUrl={ DASHBOARD_URL } onClose={ onClose } /> );
	return onClose;
};

describe( 'SwitchOnDialog', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Object.keys( mockFlags() ).forEach( ( flag ) => delete mockFlags()[ flag ] );
		mockEnablePreview.mockResolvedValue( true );
		mockIsEnabling = false;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	it( 'asks before switching on, and counts the ask once', () => {
		renderDialog();

		expect(
			screen.getByRole( 'dialog', { name: 'Switch on the new Traffic tab?' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Switch it on' } ) ).toBeVisible();
		expect(
			mockRecordTracksEvent.mock.calls.filter(
				( [ name ] ) => name === 'calypso_stats_premium_analytics_preview_menu_item_clicked'
			)
		).toHaveLength( 1 );
	} );

	it( 'switches on, records it, and takes the reader to the new Traffic tab', async () => {
		renderDialog();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( mockEnablePreview ).toHaveBeenCalledWith( true );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_menu_enabled',
			{ blog_id: 123 }
		);
		// The site is on: nothing should offer it again, on this page or the next SPA one.
		expect( mockSetQueryData ).toHaveBeenCalledWith( [ 'stats', 'premium-analytics-status', 123 ], {
			jetpack_premium_analytics_enabled: true,
		} );
		// Still on its way out: nothing to press again while the page unloads.
		expect( screen.getByRole( 'button', { name: 'Switching it on…' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		// The beacon gets a head start on the navigation.
		expect( window.location.href ).toBe( '' );
		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );
	} );

	/**
	 * Back from the new Traffic tab, the browser can restore this page from its cache with the
	 * dialog still open and every way out disabled.
	 */
	it( 'closes itself when the page is restored from the back/forward cache', () => {
		const onClose = renderDialog();

		const restored = new Event( 'pageshow' );
		Object.defineProperty( restored, 'persisted', { value: true } );
		window.dispatchEvent( restored );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
		// A plain load is not a restore.
		window.dispatchEvent( new Event( 'pageshow' ) );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the reader here with a way to retry when the write fails', async () => {
		mockEnablePreview.mockRejectedValueOnce( new Error( 'offline' ) );
		const onClose = renderDialog();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
			'We couldn’t switch on the new Traffic tab.'
		);
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_menu_enable_failed',
			{ blog_id: 123, reason: 'request_failed' }
		);
		expect( window.location.href ).toBe( '' );
		expect( onClose ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'button', { name: 'Switch it on' } ) ).toBeEnabled();
	} );

	/**
	 * The site reports what it ended up with, and a filter can hold the dashboard at off. Sending
	 * the reader to a page that will not be there is worse than saying so.
	 */
	it( 'treats a write the site held at off as a failure', async () => {
		mockEnablePreview.mockResolvedValueOnce( false );
		renderDialog();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_menu_enable_failed',
			{ blog_id: 123, reason: 'not_enabled' }
		);
		expect( window.location.href ).toBe( '' );
	} );

	it( 'records a cancellation when closed without switching on', async () => {
		const onClose = renderDialog();

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_menu_cancelled',
			{ blog_id: 123 }
		);
		expect( mockEnablePreview ).not.toHaveBeenCalled();
	} );

	it( 'cannot be dismissed while the write is in flight', async () => {
		mockIsEnabling = true;
		const onClose = renderDialog();

		expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeDisabled();

		const button = screen.getByRole( 'button', { name: 'Switching it on…' } );
		expect( button ).toHaveClass( 'is-busy' );
		// Marked busy rather than removed from the tab order, so keyboard focus stays put - and a
		// second activation still can't reach the handler.
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		await userEvent.click( button );
		expect( mockEnablePreview ).not.toHaveBeenCalled();

		await userEvent.keyboard( '{Escape}' );
		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'files its events under Odyssey in wp-admin', () => {
		mockFlags().is_odyssey = true;

		renderDialog();

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_odyssey_stats_premium_analytics_preview_menu_item_clicked',
			{ blog_id: 123 }
		);
	} );
} );
