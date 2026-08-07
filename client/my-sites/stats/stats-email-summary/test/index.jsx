/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StatsEmailSummary from '../index';

jest.mock( '@automattic/components', () => ( {
	Tooltip: ( { children } ) => children,
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text, options ) =>
		Object.entries( options?.args ?? {} ).reduce(
			( translated, [ key, value ] ) => translated.replace( `%(${ key })s`, value ),
			text
		),
} ) );

jest.mock(
	'calypso/my-sites/stats/components/stats-main',
	() =>
		( { children } ) =>
			children
);

jest.mock( 'calypso/my-sites/stats/hooks/use-should-gate-stats', () => ( {
	useShouldGateStats: () => false,
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-stats-navigation-history', () => ( {
	recordCurrentScreen: jest.fn(),
	useStatsBreadcrumbTrail: () => [],
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-stats-strings', () => () => ( {
	emails: {},
} ) );

jest.mock( 'calypso/my-sites/stats/stats-download-csv', () => () => null );
jest.mock( 'calypso/my-sites/stats/stats-download-csv-upsell', () => () => null );
jest.mock( 'calypso/my-sites/stats/stats-page-view-tracker', () => () => null );

jest.mock(
	'calypso/my-sites/stats/stats-module',
	() =>
		( { formatValue } ) =>
			formatValue( 0, {
				clicks: '5',
				unique_clicks: '0',
				clicks_rate: '0',
				total_sends: '100',
			} )
);

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector ) => selector(),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

describe( 'StatsEmailSummary', () => {
	it( 'shows total clicks when unique click data is unavailable', () => {
		render(
			<StatsEmailSummary period={ { period: 'day' } } query={ {} } context={ { query: {} } } />
		);

		expect( screen.getByText( '5' ) ).toBeVisible();
		expect( screen.getByText( 'Total clicks: 5' ) ).toBeVisible();
	} );
} );
