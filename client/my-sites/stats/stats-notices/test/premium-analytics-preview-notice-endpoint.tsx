/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNoticesVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import PremiumAnalyticsPreviewNotice from '../premium-analytics-preview-notice';

jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = () => false;
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: ( ...args: unknown[] ) => mockGet( ...args ),
			post: ( ...args: unknown[] ) => mockPost( ...args ),
		},
	},
} ) );

const SITE_ID = 123;
const THIRTY_DAYS = 30 * 24 * 3600;

// The notices host mounts the banner only once the query says so, which is what puts the record
// in the cache before the banner's first render.
const Host = () => {
	const { data } = useNoticesVisibilityQuery( SITE_ID );
	return data?.premium_analytics_preview === true ? (
		<PremiumAnalyticsPreviewNotice
			siteId={ SITE_ID }
			isOdysseyStats={ false }
			premiumAnalyticsDashboardUrl={ null }
		/>
	) : null;
};

const renderHost = () => {
	const client = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	return render(
		<QueryClientProvider client={ client }>
			<Host />
		</QueryClientProvider>
	);
};

const closeNotice = async () =>
	userEvent.click( await screen.findByRole( 'button', { name: 'close' } ) );

describe( 'PremiumAnalyticsPreviewNotice against the notices endpoint', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockPost.mockResolvedValue( { updated: true } );
	} );

	it( 'keeps the single 30-day hold when an older server answers a flat map', async () => {
		mockGet.mockResolvedValue( { premium_analytics_preview: true } );

		renderHost();
		await closeNotice();

		expect( mockGet ).toHaveBeenCalledWith( expect.anything(), { include_details: true } );
		expect( mockPost.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			id: 'premium_analytics_preview',
			status: 'postponed',
			postponed_for: THIRTY_DAYS,
		} );
	} );

	it( 'dismisses for good once the record says the invitation already came back', async () => {
		mockGet.mockResolvedValue( {
			premium_analytics_preview: {
				show: true,
				status: 'postponed',
				postponed_count: 1,
				next_show_at: 1_700_000_000,
			},
		} );

		renderHost();
		await closeNotice();

		expect( mockPost.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			id: 'premium_analytics_preview',
			status: 'dismissed',
			postponed_for: 0,
		} );
	} );
} );
