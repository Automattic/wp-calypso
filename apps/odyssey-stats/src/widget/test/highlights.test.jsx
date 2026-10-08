/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useReferrersQuery from '../../hooks/use-referrers-query';
import useTopPostsQuery from '../../hooks/use-top-posts-query';
import Highlights from '../highlights';
import recordWidgetEvent, { recordWidgetEventThenFollow } from '../record-widget-event';

jest.mock( '../../hooks/use-top-posts-query' );
jest.mock( '../../hooks/use-referrers-query' );
// Premium Analytics off, so the links are the classic Stats ones; highlights.test.tsx covers it on.
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => () => ( {
	data: false,
} ) );
jest.mock( '../../lib/config-api', () => ( { optionalConfig: () => undefined } ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );
jest.mock( '../record-widget-event', () => ( {
	__esModule: true,
	default: jest.fn(),
	recordWidgetEventThenFollow: jest.fn( () => jest.fn() ),
} ) );

const SITE_ID = 123;
const RANGE = {
	id: 'last_12_months',
	unit: 'month',
	quantity: 12,
	startDate: '2025-11-01',
	endDate: '2026-10-06',
};

/**
 * @param {Object} state         What a query returns.
 * @param {Array}  state.data    The items it resolved with.
 * @param {string} state.error   The error it failed with.
 * @param {boolean} state.loading Whether it is still fetching.
 */
const queryState = ( { data, error, loading } = {} ) => ( {
	data: error ? undefined : ( data ?? [] ),
	isPending: !! loading,
	isError: !! error,
} );

const items = ( ...titles ) =>
	titles.map( ( title, id ) => ( { id, title, views: 10, url: `https://${ title }/` } ) );

function highlights( { posts, referrers } ) {
	useTopPostsQuery.mockReturnValue( queryState( posts ) );
	useReferrersQuery.mockReturnValue( queryState( referrers ) );

	return (
		<Highlights
			siteId={ SITE_ID }
			statsBaseUrl="https://example.com/wp-admin/admin.php?page=stats"
			range={ RANGE }
			gmtOffset={ 0 }
		/>
	);
}

const renderHighlights = ( lists ) => render( highlights( lists ) );

describe( 'Highlights', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		global.ResizeObserver = class {
			observe() {}
			disconnect() {}
		};
	} );

	it( 'drops the section when both lists come back empty, leaving no card of empty tabs', () => {
		const { container } = renderHighlights( { posts: {}, referrers: {} } );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'keeps the section when both requests fail, since a failure is not an empty range', () => {
		renderHighlights( {
			posts: { error: 'http_request_failed' },
			referrers: { error: 'http_request_failed' },
		} );

		expect( screen.getByText( 'Popular content & referrers' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'See more' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'No data to show' ) ).toBeInTheDocument();
	} );

	it( 'opens "See more" on the same days the list covers', () => {
		renderHighlights( { posts: { data: items( 'Hello world' ) }, referrers: {} } );

		expect( screen.getByRole( 'link', { name: 'See more' } ) ).toHaveAttribute(
			'href',
			`https://example.com/wp-admin/admin.php?page=stats/stats/day/posts/${ SITE_ID }?chartStart=2025-11-01&chartEnd=2026-10-06`
		);
	} );

	it.each( [
		[ 'posts failed', { posts: { error: 'http_request_failed' }, referrers: {} } ],
		[ 'referrers failed', { posts: {}, referrers: { error: 'http_request_failed' } } ],
		[ 'posts loading', { posts: { loading: true }, referrers: {} } ],
		[ 'referrers loading', { posts: {}, referrers: { loading: true } } ],
		[ 'only posts', { posts: { data: items( 'Homepage' ) }, referrers: {} } ],
		[ 'only referrers', { posts: {}, referrers: { data: items( 'google.com' ) } } ],
	] )( 'keeps the section with %s, the other list empty', ( _, lists ) => {
		renderHighlights( lists );

		expect( screen.getByText( 'Popular content & referrers' ) ).toBeInTheDocument();
	} );

	it( 'shows the top five rows', () => {
		renderHighlights( {
			posts: { data: items( 'a', 'b', 'c', 'd', 'e', 'f', 'g' ) },
			referrers: {},
		} );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 5 );
	} );

	it( 'opens referrers in a new tab, and their "See more" on the referrers report', async () => {
		renderHighlights( {
			posts: { data: items( 'Homepage' ) },
			referrers: { data: items( 'google.com' ) },
		} );

		await userEvent.click( screen.getByRole( 'tab', { name: 'Top Referrers' } ) );

		const row = screen.getByRole( 'link', { name: /google\.com/ } );
		expect( row ).toHaveAttribute( 'href', 'https://google.com/' );
		expect( row ).toHaveAttribute( 'target', '_blank' );
		expect( screen.getByRole( 'link', { name: 'See more' } ) ).toHaveAttribute(
			'href',
			`https://example.com/wp-admin/admin.php?page=stats/stats/day/referrers/${ SITE_ID }?chartStart=2025-11-01&chartEnd=2026-10-06`
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'see_more_clicked', {
			tab: 'top_referrers',
			range: 'last_12_months',
		} );
	} );

	it( 'records a tab switch, but not the tab it opens on', async () => {
		renderHighlights( {
			posts: { data: items( 'Homepage' ) },
			referrers: { data: items( 'google.com' ) },
		} );
		expect( recordWidgetEvent ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'tab', { name: 'Top Referrers' } ) );

		expect( recordWidgetEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordWidgetEvent ).toHaveBeenCalledWith( 'highlights_tab_clicked', {
			tab: 'top_referrers',
		} );
	} );

	it( 'comes back on the chosen tab after an empty range, without recording a switch', async () => {
		const lists = {
			posts: { data: items( 'Homepage' ) },
			referrers: { data: items( 'google.com' ) },
		};
		const { rerender } = renderHighlights( lists );
		await userEvent.click( screen.getByRole( 'tab', { name: 'Top Referrers' } ) );

		rerender( highlights( { posts: {}, referrers: {} } ) );
		expect( screen.queryByText( 'Popular content & referrers' ) ).not.toBeInTheDocument();
		rerender( highlights( lists ) );

		expect( screen.getByRole( 'tab', { name: 'Top Referrers' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect( recordWidgetEvent ).toHaveBeenCalledTimes( 1 );
	} );
} );
