/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumAnalyticsPreviewNotice from '../premium-analytics-preview-notice';

const mockGetSiteAdminUrl = jest.fn();
jest.mock( 'calypso/state/sites/selectors/get-site-admin-url', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockGetSiteAdminUrl( ...args ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockPostponeNotice = jest.fn();
const mockPostponeNoticeIndefinitely = jest.fn();
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
const TEN_YEARS = 3650 * 24 * 3600;

const renderNotice = ( isOdysseyStats = false ) =>
	render( <PremiumAnalyticsPreviewNotice siteId={ 123 } isOdysseyStats={ isOdysseyStats } /> );

describe( 'PremiumAnalyticsPreviewNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		localStorage.clear();
		mockGetSiteAdminUrl.mockReturnValue( DASHBOARD_URL );
		mockPostponeNotice.mockResolvedValue( undefined );
		mockPostponeNoticeIndefinitely.mockResolvedValue( undefined );
		// The component holds one mutation per postponement length; hand each its own spy.
		mockUseNoticeVisibilityMutation.mockImplementation( ( ...args: unknown[] ) =>
			args[ 3 ] === TEN_YEARS
				? { mutateAsync: mockPostponeNoticeIndefinitely }
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

	it( 'asks the selector for the dashboard page, not the bare admin root', () => {
		renderNotice();

		expect( mockGetSiteAdminUrl ).toHaveBeenCalledWith(
			expect.anything(),
			123,
			'admin.php?page=jetpack-premium-analytics-wp-admin'
		);
	} );

	it( 'renders nothing when the site record has no admin URL to land on', () => {
		mockGetSiteAdminUrl.mockReturnValue( null );

		renderNotice();

		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();
		// An impression for a banner nobody saw would inflate exactly the population the guard
		// exists to exclude.
		expect( mockRecordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_viewed',
			expect.anything()
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

	it( 'hides the close button while the write is in flight', () => {
		mockIsEnabling = true;

		renderNotice();

		const button = screen.getByRole( 'button', { name: 'Switching it on…' } );
		expect( button ).toBeDisabled();
		expect( button ).toHaveClass( 'is-busy' );
		expect( screen.queryByRole( 'button', { name: 'close' } ) ).not.toBeInTheDocument();
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
		expect( mockPostponeNoticeIndefinitely ).not.toHaveBeenCalled();
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

	it( 'tracks dismissals under the Odyssey prefix when running in wp-admin', async () => {
		renderNotice( true );

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_odyssey_stats_premium_analytics_preview_notice_dismissed',
			{ blog_id: 123, dismissal_count: 1 }
		);
		expect( mockPostponeNotice ).toHaveBeenCalled();
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
		expect( mockPostponeNoticeIndefinitely ).not.toHaveBeenCalled();
	} );

	it( 'stops inviting the site once it has been turned down twice', async () => {
		const { unmount } = renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockPostponeNoticeIndefinitely ).toHaveBeenCalledTimes( 1 );
		expect( mockPostponeNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_dismissed',
			{ blog_id: 123, dismissal_count: 2 }
		);
	} );

	it( 'does not hide the notice for a different site after a dismissal', async () => {
		const { rerender } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();

		rerender( <PremiumAnalyticsPreviewNotice siteId={ 456 } isOdysseyStats={ false } /> );

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
	} );
} );
