/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Highlights from '../highlights';

jest.mock( '../../hooks/use-top-posts-query', () => () => ( { data: [], isFetching: false } ) );
jest.mock( '../../hooks/use-referrers-query', () => () => ( { data: [], isFetching: false } ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => () => ( {
	data: true,
} ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );

/**
 * The dashboard route a link opens, as the dashboard reads it out of the `p` param.
 * @param name The link text.
 */
function routeOf( name: string ) {
	const href = screen.getByRole( 'link', { name } ).getAttribute( 'href' ) ?? '';
	return new URL( href ).searchParams.get( 'p' );
}

describe( 'Highlights', () => {
	beforeEach( () => {
		jest.useFakeTimers().setSystemTime( new Date( '2026-09-30T12:00:00Z' ) );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'opens both reports on the seven days the highlights cover', () => {
		render( <Highlights siteId={ 1 } gmtOffset={ 0 } statsBaseUrl="https://example.com/stats" /> );

		const sevenDays =
			'from=2026-09-24T00%3A00%3A00.000%2B00%3A00&to=2026-09-30T23%3A59%3A59.999%2B00%3A00';
		expect( routeOf( 'View all posts & pages stats' ) ).toBe( `/reports/posts?${ sevenDays }` );
		expect( routeOf( 'View all referrer stats' ) ).toBe( `/reports/referrers?${ sevenDays }` );
	} );
} );
