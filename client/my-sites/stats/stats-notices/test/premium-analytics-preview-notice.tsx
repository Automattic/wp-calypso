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

const renderNotice = ( isOdysseyStats = false ) =>
	render( <PremiumAnalyticsPreviewNotice siteId={ 123 } isOdysseyStats={ isOdysseyStats } /> );

describe( 'PremiumAnalyticsPreviewNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetSiteAdminUrl.mockReturnValue( DASHBOARD_URL );
		mockPostponeNotice.mockResolvedValue( undefined );
		mockUseNoticeVisibilityMutation.mockReturnValue( { mutateAsync: mockPostponeNotice } );
		mockEnablePreview.mockResolvedValue( true );
		mockIsEnabling = false;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	it( 'invites the site to switch the new dashboard on', () => {
		renderNotice();

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try it now' } ) ).toBeVisible();
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
	} );

	it( 'postpones dismissals of its own notice id off any practical timer', () => {
		renderNotice();

		expect( mockUseNoticeVisibilityMutation ).toHaveBeenCalledWith(
			123,
			'premium_analytics_preview',
			'postponed',
			3650 * 24 * 3600
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

		await userEvent.click( screen.getByRole( 'button', { name: 'Try it now' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_premium_analytics_preview_notice_enable_button_clicked',
			{ blog_id: 123 }
		);
		expect( mockEnablePreview ).toHaveBeenCalledWith( true );

		const link = await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } );
		expect( link ).toHaveAttribute( 'href', DASHBOARD_URL );
		expect(
			screen.getByText( 'The new Traffic page is switched on for this site.' )
		).toBeVisible();
		// The customer chooses when to leave the page they were reading.
		expect( window.location.href ).toBe( '' );
	} );

	it( 'shows the button busy while the write is in flight', () => {
		mockIsEnabling = true;

		renderNotice();

		const button = screen.getByRole( 'button', { name: 'Switching it on…' } );
		expect( button ).toBeDisabled();
		expect( button ).toHaveClass( 'is-busy' );
	} );

	it( 'never makes the customer wait on the dismissal round-trip', async () => {
		const order: string[] = [];
		// A dismissal that never settles must not hold the button, nor the link.
		mockPostponeNotice.mockImplementation( () => {
			order.push( 'postpone' );
			return new Promise( () => {} );
		} );
		mockEnablePreview.mockImplementation( () => {
			order.push( 'enable' );
			return Promise.resolve( true );
		} );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try it now' } ) );

		expect(
			await screen.findByRole( 'link', { name: 'Go to the new Traffic page' } )
		).toBeVisible();
		expect( order ).toEqual( [ 'enable', 'postpone' ] );
	} );

	it( 'stays put and explains itself when the write fails', async () => {
		mockEnablePreview.mockRejectedValue( new Error( 'nope' ) );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try it now' } ) );

		expect( await screen.findByRole( 'alert' ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
	} );

	it( 'does not offer the link when the site reports the dashboard is still off', async () => {
		mockEnablePreview.mockResolvedValue( false );

		renderNotice();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try it now' } ) );

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
			{ blog_id: 123 }
		);
		expect( mockPostponeNotice ).toHaveBeenCalled();
	} );

	it( 'does not hide the notice for a different site after a dismissal', async () => {
		const { rerender } = renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();

		rerender( <PremiumAnalyticsPreviewNotice siteId={ 456 } isOdysseyStats={ false } /> );

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
	} );
} );
