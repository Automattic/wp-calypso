/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import AllTimeHighlightsSection from '..';
import { normalizers } from '../../../../../state/stats/lists/utils';
import type { ReactNode } from 'react';

jest.mock( '@automattic/components', () => ( {
	Card: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
	DotPager: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
	ComponentSwapper: ( {
		breakpointInactiveComponent,
	}: {
		breakpointInactiveComponent: ReactNode;
	} ) => breakpointInactiveComponent,
} ) );
jest.mock( 'calypso/components/data/query-posts', () => () => null );
jest.mock( 'calypso/components/data/query-site-stats', () => () => null );
jest.mock( '../post-cards-group', () => () => null );
jest.mock( '../../../stats-card-upsell', () => () => null );
jest.mock( '../../../hooks/use-should-gate-stats', () => ( {
	useShouldGateStats: () => false,
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserLocale: () => 'en',
} ) );
let mockInsights: unknown;
jest.mock( 'calypso/state/stats/lists/selectors', () => ( {
	isRequestingSiteStatsForQuery: () => false,
	getSiteStatsNormalizedData: ( _state: unknown, _siteId: number, statType: string ) =>
		statType === 'statsInsights' ? mockInsights : {},
} ) );

function renderInsights( dayPercent: number | null, hourPercent: number | null ) {
	mockInsights = normalizers.statsInsights( {
		highest_day_of_week: dayPercent === null ? null : 6,
		highest_day_percent: dayPercent,
		highest_hour: hourPercent === null ? null : 11,
		highest_hour_percent: hourPercent,
	} );
	render( <AllTimeHighlightsSection siteId={ 123 } siteSlug="example.com" /> );
	const heading = screen.getByRole( 'heading', { name: 'Most popular time' } );
	return within( heading.parentElement! );
}

describe( 'Insights most popular time', () => {
	it( 'hides percentages when both groups are unknown', () => {
		const card = renderInsights( null, null );
		expect( card.queryByText( /of views/ ) ).not.toBeInTheDocument();
	} );

	it( 'preserves the known day when the hour is unknown', () => {
		const card = renderInsights( 10, null );
		expect( card.getByText( 'Sunday' ) ).toBeVisible();
		expect( card.getByText( '10% of views' ) ).toBeVisible();
		expect( card.queryByText( '0% of views' ) ).not.toBeInTheDocument();
	} );

	it( 'preserves the known hour when the day is unknown', () => {
		const card = renderInsights( null, 5 );
		expect( card.getByText( '11:00 AM' ) ).toBeVisible();
		expect( card.getByText( '5% of views' ) ).toBeVisible();
		expect( card.queryByText( '0% of views' ) ).not.toBeInTheDocument();
	} );

	it( 'preserves known zero percentages', () => {
		const card = renderInsights( 0, 0 );
		expect( card.getAllByText( '0% of views' ) ).toHaveLength( 2 );
	} );
} );
