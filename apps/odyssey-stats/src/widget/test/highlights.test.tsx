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
	isPending: false,
	isError: false,
} ) );
jest.mock( '../../hooks/use-referrers-query', () => () => ( {
	data: [],
	isPending: false,
	isError: false,
} ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => () => ( {
	data: true,
} ) );
jest.mock( '../../lib/config-api', () => ( { optionalConfig: () => undefined } ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );

/**
 * The address a link opens, the dashboard route in its `p` param, and the days that route opens on.
 * @param link The link.
 */
function parse( link: HTMLElement | null ) {
	const href = link?.closest( 'a' )?.getAttribute( 'href' ) ?? '';
	const route = new URL( href ).searchParams.get( 'p' ) ?? '';
	const [ path, query = '' ] = route.split( '?' );
	const search = new URLSearchParams( query );
	return { href, path, from: search.get( 'from' ), to: search.get( 'to' ) };
}

function renderHighlights() {
	render(
		<Highlights
			siteId={ 1 }
			statsBaseUrl="https://example.com/stats"
			rangeId="last_12_months"
			startDate="2025-11-01"
			endDate="2026-10-06"
			gmtOffset={ 0 }
		/>
	);
}

describe( 'Highlights with Premium Analytics', () => {
	beforeEach( () => {
		global.ResizeObserver = class {
			observe() {}
			disconnect() {}
		} as unknown as typeof ResizeObserver;
	} );

	it( 'opens the report on the days the list covers', () => {
		renderHighlights();

		expect( parse( screen.getByRole( 'link', { name: 'See more' } ) ) ).toMatchObject( {
			path: '/reports/posts',
			from: '2025-11-01T00:00:00.000+00:00',
			to: '2026-10-06T23:59:59.999+00:00',
		} );
	} );

	it( 'opens a post row on the days the list covers', () => {
		renderHighlights();

		expect( parse( screen.getByText( 'Monitor a running process' ) ) ).toMatchObject( {
			path: '/post/328',
			from: '2025-11-01T00:00:00.000+00:00',
			to: '2026-10-06T23:59:59.999+00:00',
		} );
	} );

	it( 'keeps the Stats link for a row without a post ID, which has no dashboard page', () => {
		renderHighlights();

		expect( parse( screen.getByText( 'Home page / Archives' ) ).href ).toBe(
			'https://example.com/stats/stats/post/0/1'
		);
	} );
} );
