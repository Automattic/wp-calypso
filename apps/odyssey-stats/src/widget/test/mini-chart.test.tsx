/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import MiniChart from '../mini-chart';

jest.mock( '../../hooks/use-visits-query', () => () => ( { isLoading: false, data: [] } ) );
jest.mock( 'calypso/my-sites/stats/stats-chart-tabs/utility', () => ( {
	buildChartData: () => [ { period: '2026-10-02', value: 3 } ],
} ) );
jest.mock(
	'calypso/components/chart',
	() =>
		( { barClick }: { barClick: ( bar: object ) => void } ) => (
			<button onClick={ () => barClick( { data: { period: '2026-10-02', value: 3 } } ) }>
				bar
			</button>
		)
);
jest.mock( 'calypso/components/chart/legend', () => () => null );
jest.mock( 'calypso/blocks/stats-navigation/intervals', () => () => null );
let mockPremiumAnalyticsEnabled = true;
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => () => ( {
	data: mockPremiumAnalyticsEnabled,
} ) );
jest.mock( '../../lib/config-api', () => ( { optionalConfig: () => undefined } ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );

describe( 'MiniChart', () => {
	beforeEach( () => {
		mockPremiumAnalyticsEnabled = true;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	// At 11:00 UTC on 1 October it is already 2 October on a site at UTC+14.
	it( 'opens the bar for the site’s today on that day while the browser is still on the day before', () => {
		jest.useFakeTimers().setSystemTime( new Date( '2026-10-01T11:00:00Z' ) );
		render( <MiniChart siteId={ 1 } gmtOffset={ 14 } statsBaseUrl="https://example.com/stats" /> );

		fireEvent.click( screen.getByText( 'bar' ) );

		expect( new URL( window.location.href ).searchParams.get( 'p' ) ).toBe(
			'/?from=2026-10-02T00%3A00%3A00.000%2B14%3A00&to=2026-10-02T23%3A59%3A59.999%2B14%3A00'
		);
	} );

	it( 'opens classic Stats on the site’s today, not the browser’s, when Premium Analytics is off', () => {
		mockPremiumAnalyticsEnabled = false;
		jest.useFakeTimers().setSystemTime( new Date( '2026-10-01T11:00:00Z' ) );
		render( <MiniChart siteId={ 1 } gmtOffset={ 14 } statsBaseUrl="https://example.com/stats" /> );

		fireEvent.click( screen.getByText( 'bar' ) );

		expect( window.location.href ).toBe(
			'https://example.com/stats/stats/hour/1?chartStart=2026-10-02&chartEnd=2026-10-02'
		);
	} );
} );
