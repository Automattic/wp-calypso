/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import useReferrersQuery from '../../hooks/use-referrers-query';
import useTopPostsQuery from '../../hooks/use-top-posts-query';
import {
	getDateRange,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
} from '../../lib/date-ranges';
import Highlights from '../highlights';

jest.mock( '../../hooks/use-top-posts-query' );
jest.mock( '../../hooks/use-referrers-query' );

const SITE_ID = 123;

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

const items = ( ...titles ) => titles.map( ( title, id ) => ( { id, title, views: 10 } ) );

function renderHighlights( { posts, referrers, rangeId = DATE_RANGE_LAST_7_DAYS } ) {
	useTopPostsQuery.mockReturnValue( queryState( posts ) );
	useReferrersQuery.mockReturnValue( queryState( referrers ) );

	return render(
		<Highlights
			siteId={ SITE_ID }
			gmtOffset={ 0 }
			statsBaseUrl="https://example.com/wp-admin/admin.php?page=stats"
			range={ getDateRange( rangeId ) }
		/>
	);
}

describe( 'Highlights', () => {
	beforeEach( () => {
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
		jest.useFakeTimers().setSystemTime( new Date( '2026-10-06T12:00:00Z' ) );
		renderHighlights( {
			posts: { data: items( 'Hello world' ) },
			referrers: {},
			rangeId: DATE_RANGE_LAST_12_MONTHS,
		} );
		jest.useRealTimers();

		expect( screen.getByRole( 'link', { name: 'See more' } ) ).toHaveAttribute(
			'href',
			`https://example.com/wp-admin/admin.php?page=stats/stats/day/posts/${ SITE_ID }?chartStart=2025-11-01&chartEnd=2026-10-06`
		);
	} );

	it( 'keeps the section while a list is still loading', () => {
		renderHighlights( { posts: { loading: true }, referrers: {} } );

		expect( screen.getByText( 'Popular content & referrers' ) ).toBeInTheDocument();
	} );

	it( 'keeps the section when only one list has items', () => {
		renderHighlights( { posts: { data: items( 'Homepage' ) }, referrers: {} } );

		expect( screen.getByText( 'Homepage' ) ).toBeInTheDocument();
	} );
} );
