/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Highlights from '../highlights';

jest.mock( '../../hooks/use-top-posts-query', () => () => ( {
	data: [
		{ id: 328, title: 'Monitor a running process', views: 1 },
		{ id: 0, title: 'Home page / Archives', views: 17 },
	],
	isFetching: false,
} ) );
jest.mock( '../../hooks/use-referrers-query', () => () => ( { data: [], isFetching: false } ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => () => ( {
	data: true,
} ) );
jest.mock( '../../lib/config-api', () => ( { optionalConfig: () => undefined } ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );

/**
 * The address a link opens, and the dashboard route in its `p` param.
 * @param text The link text, or text inside the link.
 */
function linkOf( text: string ) {
	const href = screen.getByText( text ).closest( 'a' )?.getAttribute( 'href' ) ?? '';
	return { href, route: new URL( href ).searchParams.get( 'p' ) };
}

describe( 'Highlights', () => {
	it( 'opens both reports on the last seven days preset', () => {
		render( <Highlights siteId={ 1 } gmtOffset={ 0 } statsBaseUrl="https://example.com/stats" /> );

		expect( linkOf( 'View all posts & pages stats' ).route ).toBe(
			'/reports/posts?preset=last-7-days'
		);
		expect( linkOf( 'View all referrer stats' ).route ).toBe(
			'/reports/referrers?preset=last-7-days'
		);
	} );

	it( 'opens a post row on the last seven days preset', () => {
		render( <Highlights siteId={ 1 } gmtOffset={ 0 } statsBaseUrl="https://example.com/stats" /> );

		expect( linkOf( 'Monitor a running process' ).route ).toBe( '/post/328?preset=last-7-days' );
	} );

	it( 'keeps the Stats link for a row without a post ID, which has no dashboard page', () => {
		render( <Highlights siteId={ 1 } gmtOffset={ 0 } statsBaseUrl="https://example.com/stats" /> );

		expect( linkOf( 'Home page / Archives' ).href ).toBe(
			'https://example.com/stats/stats/post/0/1'
		);
	} );
} );
