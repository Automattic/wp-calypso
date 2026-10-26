/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePaginatedStream } from 'calypso/reader/data/stream';
import { OnThisDay } from 'calypso/reader/on-this-day';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import type { View } from '@wordpress/dataviews';
import type { StreamListItem } from 'calypso/reader/data/stream/types';

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => false,
} ) );

jest.mock( '@wordpress/dataviews', () => ( {
	DataViews: ( {
		view,
		data,
		paginationInfo,
		onChangeView,
	}: {
		view: View;
		data: StreamListItem[];
		paginationInfo: { totalItems: number; totalPages: number };
		onChangeView: ( view: View ) => void;
	} ) => (
		<div>
			<button onClick={ () => onChangeView( { ...view, page: 2 } ) }>Page 2</button>
			<button onClick={ () => onChangeView( { ...view, page: 3 } ) }>Page 3</button>
			<ul aria-label="Posts">
				{ data.map( ( item ) => (
					<li key={ item.postId }>{ item.postId }</li>
				) ) }
			</ul>
			<output aria-label="Pagination totals">
				{ paginationInfo.totalItems } items, { paginationInfo.totalPages } pages
			</output>
		</div>
	),
	filterSortAndPaginate: ( data: StreamListItem[], view: View ) => {
		const perPage = view.perPage ?? 15;
		const start = ( ( view.page ?? 1 ) - 1 ) * perPage;
		return {
			data: data.slice( start, start + perPage ),
			paginationInfo: {
				totalItems: data.length,
				totalPages: Math.ceil( data.length / perPage ),
			},
		};
	},
} ) );

jest.mock( 'calypso/reader/data/stream', () => {
	const { isPaddingStreamItem } = jest.requireActual( 'calypso/reader/data/stream/types' );
	return { isPaddingStreamItem, usePaginatedStream: jest.fn() };
} );

jest.mock( 'calypso/reader/data/post/cache', () => {
	const posts: undefined[] = [];
	return { useCachedPosts: () => posts };
} );

jest.mock( 'calypso/reader/data/site-subscriptions', () => {
	const subscriptions: never[] = [];
	return { useSiteSubscriptions: () => ( { subscriptions } ) };
} );

jest.mock( 'calypso/state/reader-ui/actions', () => ( {
	viewStream: () => ( { type: 'TEST_VIEW_STREAM' } ),
} ) );

jest.mock( 'calypso/components/async-load', () => () => null );
jest.mock( 'calypso/components/navigation-header', () => () => null );
jest.mock( 'calypso/reader/stream/empty', () => () => null );
jest.mock( 'calypso/reader/on-this-day/on-this-day-post-field', () => ( {
	OnThisDayPostField: () => null,
} ) );
jest.mock( 'calypso/reader/on-this-day/on-this-day-post-skeleton', () => ( {
	OnThisDayPostSkeleton: () => null,
} ) );

describe( 'On This Day pagination', () => {
	it( 'removes settled padding when returning to a short page without shifting later posts', async () => {
		const user = userEvent.setup();
		const items: StreamListItem[] = Array.from( { length: 45 }, ( _, index ) => ( {
			feedId: 200,
			postId: 300 + index,
		} ) );
		items[ 29 ] = { isPadding: true, postId: 'padding-29' };
		const streamData = {
			items,
			pagination: { totalItems: 45, totalPages: 3 },
			isRequesting: true,
			error: null,
		};
		jest.mocked( usePaginatedStream ).mockReturnValue( streamData );

		const { rerender } = renderWithProvider( <OnThisDay streamKey="on_this_day" /> );
		const pageTwoIds = Array.from( { length: 14 }, ( _, index ) => String( 315 + index ) );
		const pageThreeIds = Array.from( { length: 15 }, ( _, index ) => String( 330 + index ) );
		const expectRows = ( ids: string[] ) => {
			const rows = screen.getAllByRole( 'listitem' );
			expect( rows ).toHaveLength( ids.length );
			expect( rows.map( ( row ) => row.textContent ) ).toEqual( ids );
			expect( screen.getByRole( 'status', { name: 'Pagination totals' } ) ).toHaveTextContent(
				'45 items, 3 pages'
			);
		};

		await user.click( screen.getByRole( 'button', { name: 'Page 2' } ) );
		expectRows( [ ...pageTwoIds, 'padding-29' ] );

		jest.mocked( usePaginatedStream ).mockReturnValue( { ...streamData, isRequesting: false } );
		rerender( <OnThisDay streamKey="on_this_day" /> );
		expectRows( pageTwoIds );

		await user.click( screen.getByRole( 'button', { name: 'Page 3' } ) );
		expectRows( pageThreeIds );

		await user.click( screen.getByRole( 'button', { name: 'Page 2' } ) );
		expectRows( pageTwoIds );
	} );
} );
