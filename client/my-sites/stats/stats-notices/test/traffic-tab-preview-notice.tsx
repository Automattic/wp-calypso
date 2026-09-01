/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrafficTabPreviewNotice from '../traffic-tab-preview-notice';

jest.mock( 'calypso/state', () => ( {
	useSelector: () => 'https://example.com/wp-admin/',
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockUseNoticeVisibilityMutation = jest.fn< { mutateAsync: jest.Mock }, unknown[] >( () => ( {
	mutateAsync: jest.fn( () => Promise.resolve() ),
} ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseNoticeVisibilityMutation( ...args ),
} ) );

const mockStatusQuery = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => ( {
	__esModule: true,
	default: () => mockStatusQuery(),
} ) );

const mockEnablePreview = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutate: mockEnablePreview, isPending: false } ),
} ) );

const statusResult = ( overrides = {} ) => ( {
	data: false,
	isLoading: false,
	isError: false,
	...overrides,
} );

const renderNotice = () =>
	render( <TrafficTabPreviewNotice siteId={ 123 } isOdysseyStats={ false } /> );

describe( 'TrafficTabPreviewNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockStatusQuery.mockReturnValue( statusResult() );
	} );

	it( 'invites a site that does not have the new dashboard yet', () => {
		renderNotice();

		expect( screen.getByText( 'Try the new Traffic page' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try it now' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
	} );

	it( 'stays out of the way while the status is still loading', () => {
		mockStatusQuery.mockReturnValue( statusResult( { isLoading: true } ) );

		renderNotice();

		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();
	} );

	it( 'does not invite a site that already has the new dashboard', () => {
		mockStatusQuery.mockReturnValue( statusResult( { data: true } ) );

		renderNotice();

		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();
	} );

	it( 'stays hidden when the status cannot be read, which covers non-admins and older Jetpacks', () => {
		mockStatusQuery.mockReturnValue( statusResult( { isError: true, data: undefined } ) );

		renderNotice();

		expect( screen.queryByText( 'Try the new Traffic page' ) ).not.toBeInTheDocument();
	} );

	it( 'postpones dismissals of its own notice id off any practical timer', () => {
		renderNotice();

		expect( mockUseNoticeVisibilityMutation ).toHaveBeenCalledWith(
			123,
			'traffic_tab_preview',
			'postponed',
			3650 * 24 * 3600
		);
	} );

	it( 'records an impression only once the notice actually reaches the screen', () => {
		mockStatusQuery.mockReturnValue( statusResult( { isLoading: true } ) );
		const { rerender } = renderNotice();

		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();

		mockStatusQuery.mockReturnValue( statusResult() );
		rerender( <TrafficTabPreviewNotice siteId={ 123 } isOdysseyStats={ false } /> );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_traffic_tab_preview_notice_viewed',
			{ blog_id: 123 }
		);
	} );

	it( 'enables the dashboard and tracks the click', async () => {
		renderNotice();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try it now' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_traffic_tab_preview_notice_enable_button_clicked',
			{ blog_id: 123 }
		);
		expect( mockEnablePreview ).toHaveBeenCalledWith( true, expect.anything() );
	} );

	it( 'tracks dismissals under the Odyssey prefix when running in wp-admin', async () => {
		render( <TrafficTabPreviewNotice siteId={ 123 } isOdysseyStats /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_odyssey_stats_traffic_tab_preview_notice_dismissed',
			{ blog_id: 123 }
		);
	} );
} );
