/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PREMIUM_ANALYTICS_PAGE_PATH } from '../premium-analytics-preview-cohort';
import PremiumAnalyticsPreviewNotice from '../premium-analytics-preview-notice';

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

const mockRecordDismissal = jest.fn();
const mockUseNoticeVisibilityMutation = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => {
		mockUseNoticeVisibilityMutation( ...args );
		return { mutateAsync: mockRecordDismissal };
	},
} ) );

let mockPostponedCount = 0;
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-query', () => ( {
	useNoticeRecordQuery: () => ( {
		data: { show: true, status: null, postponed_count: mockPostponedCount, next_show_at: null },
	} ),
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
		Object.keys( mockFlags() ).forEach( ( flag ) => delete mockFlags()[ flag ] );
		mockRecordDismissal.mockResolvedValue( undefined );
		mockEnablePreview.mockResolvedValue( true );
		mockIsEnabling = false;
		mockPostponedCount = 0;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	it( 'invites the site to switch the new dashboard on', () => {
		renderNotice();

		expect( screen.getByText( 'Try the new Traffic tab' ) ).toBeVisible();
		// Accepting leaves the page, so the invitation says so up front.
		expect(
			screen.getByText(
				'We’ll take you there once it’s on. Your current Stats stay where they are.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Switch it on' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
	} );

	it( 'points at the dashboard page, not the bare admin root', () => {
		expect( PREMIUM_ANALYTICS_PAGE_PATH ).toBe(
			'admin.php?page=jetpack-premium-analytics-wp-admin'
		);
	} );

	it( 'records exactly one impression, stamped with the showing it belongs to', () => {
		mockPostponedCount = 1;

		renderNotice();

		expect(
			mockRecordTracksEvent.mock.calls.filter(
				( [ name ] ) => name === 'calypso_stats_premium_analytics_preview_notice_viewed'
			)
		).toEqual( [
			[
				'calypso_stats_premium_analytics_preview_notice_viewed',
				{ blog_id: 123, postponed_count: 1 },
			],
		] );
	} );

	it( 'switches on, records it, and takes the reader to the new Traffic tab', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enable_button_clicked',
			{ blog_id: 123 }
		);
		expect( mockEnablePreview ).toHaveBeenCalledWith( true );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enabled',
			{ blog_id: 123 }
		);

		// Still on its way out: nothing to press again while the page unloads, and no second step
		// to miss.
		const button = screen.getByRole( 'button', { name: 'Switching it on…' } );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( screen.queryByRole( 'button', { name: 'close' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /Traffic tab/ } ) ).not.toBeInTheDocument();

		// The beacon gets a head start on the navigation.
		expect( window.location.href ).toBe( '' );
		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );
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
	 * An enabled site already fails the eligibility rule, so the invitation is gone on the next
	 * load without one.
	 */
	it( 'does not record a dismissal when the invitation is accepted', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );

		expect( mockRecordDismissal ).not.toHaveBeenCalled();
	} );

	it( 'offers a retry and a way to reach support when the write fails', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( screen.getByText( 'We couldn’t switch on the new Traffic tab' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Contact support/ } ) ).toHaveAttribute(
			'href',
			'/help/contact'
		);
		expect( window.location.href ).toBe( '' );

		mockEnablePreview.mockResolvedValue( true );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );
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
	 * A failed attempt to accept is not a rejection, so it must not be recorded as one.
	 */
	it( 'does not count closing a failed attempt as a dismissal', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		expect( await screen.findByRole( 'alert' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		expect( mockRecordDismissal ).not.toHaveBeenCalled();
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

	it( 'stays put when the site reports the dashboard is still off', async () => {
		mockEnablePreview.mockResolvedValue( false );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
		expect( mockSetQueryData ).not.toHaveBeenCalled();
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
			{ blog_id: 123, postponed_count: 0 }
		);
		expect( mockRecordDismissal ).toHaveBeenCalled();
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
			'premium_analytics_preview'
		);
		expect( mockRecordDismissal ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordDismissal ).toHaveBeenCalledWith( {
			status: 'postponed',
			postponedFor: THIRTY_DAYS,
		} );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_dismissed',
			{ blog_id: 123, postponed_count: 0 }
		);
	} );

	it.each( [ 1, 2, 5 ] )(
		'dismisses the invitation for good once it has already come back (postponed %i times)',
		async ( postponedCount ) => {
			mockPostponedCount = postponedCount;

			renderNotice();

			await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

			expect( mockRecordDismissal ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordDismissal ).toHaveBeenCalledWith( { status: 'dismissed' } );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_stats_premium_analytics_preview_notice_dismissed',
				{ blog_id: 123, postponed_count: postponedCount }
			);
		}
	);

	it( 'hides the invitation before the write is answered', async () => {
		let settle: () => void = () => {};
		mockRecordDismissal.mockReturnValue(
			new Promise< void >( ( resolve ) => ( settle = resolve ) )
		);

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( screen.queryByText( 'Try the new Traffic tab' ) ).not.toBeInTheDocument();
		settle();
	} );

	it( 'stays hidden when the write fails, and says so', async () => {
		mockPostponedCount = 1;
		mockRecordDismissal.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( screen.queryByText( 'Try the new Traffic tab' ) ).not.toBeInTheDocument();
		await waitFor( () =>
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_stats_premium_analytics_preview_notice_dismiss_failed',
				{ blog_id: 123, postponed_count: 1, status: 'dismissed' }
			)
		);
	} );

	it( 'counts one impression per showing, however often the record is refreshed', () => {
		const { rerender } = renderNotice();

		mockPostponedCount = 1;
		rerender(
			<PremiumAnalyticsPreviewNotice
				siteId={ 123 }
				isOdysseyStats={ false }
				premiumAnalyticsDashboardUrl={ DASHBOARD_URL }
			/>
		);

		expect(
			mockRecordTracksEvent.mock.calls.filter(
				( [ name ] ) => name === 'calypso_stats_premium_analytics_preview_notice_viewed'
			)
		).toEqual( [
			[
				'calypso_stats_premium_analytics_preview_notice_viewed',
				{ blog_id: 123, postponed_count: 0 },
			],
		] );
	} );

	it( 'does not hide the notice for a different site after a dismissal', async () => {
		const { rerender } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		expect( screen.queryByText( 'Try the new Traffic tab' ) ).not.toBeInTheDocument();

		rerender(
			<PremiumAnalyticsPreviewNotice
				siteId={ 456 }
				isOdysseyStats={ false }
				premiumAnalyticsDashboardUrl={ DASHBOARD_URL }
			/>
		);

		expect( screen.getByText( 'Try the new Traffic tab' ) ).toBeVisible();
	} );

	/**
	 * Back from the new Traffic tab, the browser can restore this page from its cache with the
	 * button still busy. The site is on by then, so the cache says so and the notices host takes
	 * the invitation down.
	 */
	it( 'settles when the page is restored from the back/forward cache', async () => {
		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );

		// Not before leaving: the cache is what hides this notice, and it should not vanish
		// under the reader while the page is still here.
		expect( mockSetQueryData ).not.toHaveBeenCalled();

		// A plain load is not a restore.
		window.dispatchEvent( new Event( 'pageshow' ) );
		expect( mockSetQueryData ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'button', { name: 'Switching it on…' } ) ).toBeVisible();

		const restored = new Event( 'pageshow' );
		Object.defineProperty( restored, 'persisted', { value: true } );
		window.dispatchEvent( restored );

		expect( mockSetQueryData ).toHaveBeenCalledWith( [ 'stats', 'premium-analytics-status', 123 ], {
			jetpack_premium_analytics_enabled: true,
		} );
		expect( await screen.findByRole( 'button', { name: 'Switch it on' } ) ).toBeEnabled();
	} );

	it( 'stops listening for a restore once the notice is gone', async () => {
		const { unmount } = renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Switch it on' } ) );
		await waitFor( () => expect( window.location.href ).toBe( DASHBOARD_URL ) );

		unmount();

		const restored = new Event( 'pageshow' );
		Object.defineProperty( restored, 'persisted', { value: true } );
		window.dispatchEvent( restored );

		expect( mockSetQueryData ).not.toHaveBeenCalled();
	} );

	it( 'does not report a site as switched on when it was only dismissed', async () => {
		const { unmount } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();

		expect( mockSetQueryData ).not.toHaveBeenCalled();
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
