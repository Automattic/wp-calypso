/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumAnalyticsPreviewNotice, {
	PREMIUM_ANALYTICS_PAGE_PATH,
} from '../premium-analytics-preview-notice';

// The flag store is created inside the factory and parked on `globalThis`: modules read config
// while they are being imported, before any module-scope `const` here exists.
jest.mock( '@automattic/calypso-config', () => {
	const flags: Record< string, boolean > = {};
	( globalThis as Record< string, unknown > ).__previewNoticeTestFlags = flags;
	const isEnabled = ( flag: string ) => !! flags[ flag ];
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const mockFlags = () =>
	( globalThis as Record< string, unknown > ).__previewNoticeTestFlags as Record< string, boolean >;

const mockSetQueryData = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { setQueryData: mockSetQueryData } ),
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockPostponeNotice = jest.fn();
const mockDismissForGood = jest.fn();
const mockUseNoticeVisibilityMutation = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseNoticeVisibilityMutation( ...args ),
} ) );

const mockEnablePreview = jest.fn();
let mockIsEnabling = false;
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutateAsync: mockEnablePreview, isPending: mockIsEnabling } ),
} ) );

const DASHBOARD_URL =
	'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';

const THIRTY_DAYS = 30 * 24 * 3600;

const renderNotice = ( isOdysseyStats = false, dashboardUrl: string | null = DASHBOARD_URL ) =>
	render(
		<PremiumAnalyticsPreviewNotice
			siteId={ 123 }
			isOdysseyStats={ isOdysseyStats }
			premiumAnalyticsDashboardUrl={ dashboardUrl }
		/>
	);

describe( 'PremiumAnalyticsPreviewNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		localStorage.clear();
		Object.keys( mockFlags() ).forEach( ( flag ) => delete mockFlags()[ flag ] );
		mockPostponeNotice.mockResolvedValue( undefined );
		mockDismissForGood.mockResolvedValue( undefined );
		// The component holds one mutation per dismissal kind; hand each its own spy.
		mockUseNoticeVisibilityMutation.mockImplementation( ( ...args: unknown[] ) =>
			args[ 2 ] === 'dismissed'
				? { mutateAsync: mockDismissForGood }
				: { mutateAsync: mockPostponeNotice }
		);
		mockEnablePreview.mockResolvedValue( true );
		mockIsEnabling = false;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	it( 'invites the site to switch the new dashboard on', () => {
		renderNotice();

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Switch it on' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
	} );

	it( 'points at the dashboard page, not the bare admin root', () => {
		expect( PREMIUM_ANALYTICS_PAGE_PATH ).toBe(
			'admin.php?page=jetpack-premium-analytics-wp-admin'
		);
	} );

	it( 'records exactly one impression', () => {
		renderNotice();

		expect(
			mockRecordTracksEvent.mock.calls.filter(
				( [ name ] ) => name === 'calypso_stats_premium_analytics_preview_notice_viewed'
			)
		).toHaveLength( 1 );
	} );

	it( 'enables the dashboard and offers a link into it, without navigating', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enable_button_clicked',
			{ blog_id: 123 }
		);
		expect( mockEnablePreview ).toHaveBeenCalledWith( true );

		const link = await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } );
		expect( link ).toHaveAttribute( 'href', DASHBOARD_URL );
		expect( screen.getByText( 'The new Traffic page is on' ) ).toBeVisible();
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enabled',
			{ blog_id: 123 }
		);
		// The customer chooses when to leave the page they were reading.
		expect( window.location.href ).toBe( '' );
	} );

	it( 'hides the close button while the write is in flight', async () => {
		mockIsEnabling = true;

		renderNotice();

		const button = screen.getByRole( 'button', { name: 'Switching it on…' } );
		expect( button ).toHaveClass( 'is-busy' );
		expect( screen.queryByRole( 'button', { name: 'close' } ) ).not.toBeInTheDocument();

		// Marked busy rather than removed from the tab order, so keyboard focus stays put - and a
		// second activation still can't reach the handler.
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		button.focus();
		expect( button ).toHaveFocus();

		await userEvent.click( button );
		expect( mockEnablePreview ).not.toHaveBeenCalled();
	} );

	/**
	 * Recording a dismissal refetches the notices, which then answers "dismissed" and unmounts this
	 * notice - taking the link with it before anyone can follow it. An enabled site already fails
	 * the eligibility rule, so the invitation is gone on the next load without one.
	 */
	it( 'does not record a dismissal when the invitation is accepted', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect(
			await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } )
		).toBeVisible();
		expect( mockPostponeNotice ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( screen.queryByText( 'The new Traffic page is on' ) ).not.toBeInTheDocument();
		expect( mockPostponeNotice ).not.toHaveBeenCalled();
	} );

	it( 'offers a retry and a way to reach support when the write fails', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( screen.getByText( 'We couldn’t switch on the new Traffic page' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Contact support/ } ) ).toHaveAttribute(
			'href',
			'/help/contact'
		);
		expect( window.location.href ).toBe( '' );

		mockEnablePreview.mockResolvedValue( true );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect(
			await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } )
		).toBeVisible();
	} );

	it( 'points self-hosted sites at Jetpack support rather than the Calypso contact form', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice( true );
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'link', { name: /Contact support/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'jetpack.com/contact-support' )
		);
	} );

	/**
	 * Two failed attempts to accept would otherwise read as two rejections, and the second
	 * dismissal ends the invitation for good.
	 */
	it( 'does not count closing a failed attempt as a dismissal', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		expect( await screen.findByRole( 'alert' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		expect( mockPostponeNotice ).not.toHaveBeenCalled();
		expect( mockDismissForGood ).not.toHaveBeenCalled();
		expect( localStorage.getItem( 'jetpack_stats_premium_analytics_preview_dismissals_123' ) ).toBe(
			null
		);
	} );

	it( 'records why an enable failed, so uptake can be told from breakage', async () => {
		mockEnablePreview.mockResolvedValue( false );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enable_failed',
			{ blog_id: 123, reason: 'not_enabled' }
		);

		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect(
			mockRecordTracksEvent.mock.calls.some(
				( [ name, properties ] ) =>
					name === 'calypso_stats_premium_analytics_preview_notice_enable_failed' &&
					properties?.reason === 'request_failed'
			)
		).toBe( true );
	} );

	it( 'does not offer the link when the site reports the dashboard is still off', async () => {
		mockEnablePreview.mockResolvedValue( false );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Go to the new Traffic page' } )
		).not.toBeInTheDocument();
	} );

	/**
	 * The prefix follows the build, not the API the site answers on. A Simple site's wp-admin runs
	 * Odyssey with `is_running_in_jetpack_site` off, so the `isOdysseyStats` prop would file those
	 * dismissals under Calypso.
	 */
	it( 'tracks dismissals under the Odyssey prefix when running in wp-admin', async () => {
		mockFlags().is_odyssey = true;

		renderNotice( false );

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_odyssey_stats_premium_analytics_preview_notice_dismissed',
			{ blog_id: 123, dismissal_count: 1 }
		);
		expect( mockPostponeNotice ).toHaveBeenCalled();
	} );

	it( 'keeps the Calypso container class out of wp-admin', () => {
		mockFlags().is_odyssey = true;

		const { container } = renderNotice( false );

		expect( container.querySelector( '.inner-notice-container--calypso' ) ).toBeNull();
	} );

	it( 'holds the invitation back for a month on the first dismissal', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockUseNoticeVisibilityMutation ).toHaveBeenCalledWith(
			123,
			'premium_analytics_preview',
			'postponed',
			THIRTY_DAYS
		);
		expect( mockPostponeNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockDismissForGood ).not.toHaveBeenCalled();
	} );

	/**
	 * `dismissed` is the endpoint's own permanent state - no return date at all - rather than a
	 * postponement measured in decades.
	 */
	it( 'stops inviting the site once it has been turned down twice', async () => {
		const { unmount } = renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockUseNoticeVisibilityMutation ).toHaveBeenCalledWith(
			123,
			'premium_analytics_preview',
			'dismissed'
		);
		expect( mockDismissForGood ).toHaveBeenCalledTimes( 1 );
		expect( mockPostponeNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_dismissed',
			{ blog_id: 123, dismissal_count: 2 }
		);
	} );

	/**
	 * A count that ran ahead of the request would spend the customer's second dismissal on a
	 * postponement the site never recorded, ending the invitation a dismissal early.
	 */
	it( 'counts a dismissal only once the site has recorded it', async () => {
		mockPostponeNotice.mockRejectedValue( new Error( 'nope' ) );

		const { unmount } = renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockDismissForGood ).not.toHaveBeenCalled();
		expect( mockPostponeNotice ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not hide the notice for a different site after a dismissal', async () => {
		const { rerender } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();

		rerender(
			<PremiumAnalyticsPreviewNotice
				siteId={ 456 }
				isOdysseyStats={ false }
				premiumAnalyticsDashboardUrl={ DASHBOARD_URL }
			/>
		);

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
	} );

	/**
	 * The confirmation lives on local state, so leaving Traffic and coming back inside the SPA
	 * remounts this notice while the cached status still reads false - and invites a site that has
	 * just said yes.
	 */
	it( 'leaves the switched-on status behind for the next mount', async () => {
		const { unmount } = renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		expect(
			await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } )
		).toBeVisible();

		// Not while the confirmation is still on screen: that would pull it away mid-sentence.
		expect( mockSetQueryData ).not.toHaveBeenCalled();

		unmount();

		expect( mockSetQueryData ).toHaveBeenCalledWith( [ 'stats', 'premium-analytics-status', 123 ], {
			jetpack_premium_analytics_enabled: true,
		} );
	} );

	it( 'does not report a site as switched on when it was only dismissed', async () => {
		const { unmount } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();

		expect( mockSetQueryData ).not.toHaveBeenCalled();
	} );

	/**
	 * The button that had focus is removed the moment it goes busy, so without this the next Tab
	 * starts again from the top of the page.
	 */
	it( 'keeps keyboard focus on the control that replaces the button', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect(
			await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } )
		).toHaveFocus();
	} );

	it( 'moves focus to Try again when the write fails', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'button', { name: 'Try again' } ) ).toHaveFocus();
	} );

	it( 'does not steal focus when the invitation first renders', () => {
		renderNotice();

		expect( screen.getByRole( 'button', { name: 'Switch it on' } ) ).not.toHaveFocus();
	} );
} );
