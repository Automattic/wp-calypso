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
jest.mock( '../../lib/config-api', () => ( { optionalConfig: () => undefined } ) );
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
	it( 'opens both reports on the last seven days preset', () => {
		render( <Highlights siteId={ 1 } gmtOffset={ 0 } statsBaseUrl="https://example.com/stats" /> );

		expect( routeOf( 'View all posts & pages stats' ) ).toBe( '/reports/posts?preset=last-7-days' );
		expect( routeOf( 'View all referrer stats' ) ).toBe( '/reports/referrers?preset=last-7-days' );
	} );
} );
