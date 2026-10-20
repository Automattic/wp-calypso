/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import {
	getVideoPressPlaysComplete,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { useShouldGateStats } from '../../hooks/use-should-gate-stats';
import VideosPerformance from '../index';
import type { StatsQueryType } from '../../features/modules/types';

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/stats/lists/selectors', () => ( {
	getVideoPressPlaysComplete: jest.fn(),
	isRequestingSiteStatsForQuery: jest.fn(),
} ) );
jest.mock( '../../hooks/use-should-gate-stats', () => ( {
	useShouldGateStats: jest.fn(),
} ) );

const query: StatsQueryType = { date: '2026-01-01', period: 'day' };
const dataWithRows = {
	days: {
		'2026-01-01': {
			data: [ { post_id: 1, views: 5, impressions: 10, watch_time: 1, retention_rate: 50 } ],
		},
	},
};

const mockGate = useShouldGateStats as jest.Mock;
const mockData = getVideoPressPlaysComplete as unknown as jest.Mock;
const mockRequesting = isRequestingSiteStatsForQuery as jest.Mock;

describe( 'VideosPerformance', () => {
	beforeEach( () => {
		mockGate.mockReturnValue( false );
		mockData.mockReturnValue( null );
		mockRequesting.mockReturnValue( false );
	} );

	it( 'renders nothing behind the paywall, even with data', () => {
		mockGate.mockReturnValue( true );
		mockData.mockReturnValue( dataWithRows );
		const { container } = render( <VideosPerformance siteId={ 1 } query={ query } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing on a site with no videos', () => {
		const { container } = render( <VideosPerformance siteId={ 1 } query={ query } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the cards when there are videos', () => {
		mockData.mockReturnValue( dataWithRows );
		render( <VideosPerformance siteId={ 1 } query={ query } /> );
		expect( screen.getByText( 'Views' ) ).toBeVisible();
		expect( screen.getByText( 'Retention rate' ) ).toBeVisible();
	} );

	it( 'renders the cards while the list is still fetching', () => {
		mockRequesting.mockReturnValue( true );
		render( <VideosPerformance siteId={ 1 } query={ query } /> );
		expect( screen.getByText( 'Views' ) ).toBeVisible();
	} );
} );
