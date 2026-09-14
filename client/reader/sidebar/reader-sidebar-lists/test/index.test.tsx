/**
 * @jest-environment jsdom
 */
import { ReadList } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarLists from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

const mockMarkAllAsSeen = jest.fn();
jest.mock( 'calypso/reader/data/seen-posts', () => ( {
	useMarkAllAsSeenMutation: () => ( { mutate: mockMarkAllAsSeen } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	isAutomatticianQuery: () => ( {
		queryKey: [ 'is-automattician' ],
		queryFn: () => true,
		initialData: true,
	} ),
} ) );

function makeList(
	ID: number,
	feeds: ReadList[ 'feeds' ],
	overrides: Partial< ReadList > = {}
): ReadList {
	return {
		ID,
		slug: `list-${ ID }`,
		owner: 'bob',
		title: `List ${ ID }`,
		description: '',
		is_owner: true,
		is_public: true,
		feeds,
		...overrides,
	};
}

function makeRecommendedBlogsList(
	feeds: ReadList[ 'feeds' ],
	overrides: Partial< ReadList > = {}
): ReadList {
	return makeList( 99, feeds, {
		slug: 'recommended-blogs',
		title: 'Recommended Blogs',
		...overrides,
	} );
}

// The Count exposes no role/label, so scope to the header's own count element,
// separate from the per-list counts rendered inside the expandable content.
function getHeaderCount( container: HTMLElement ): HTMLElement | null {
	return container.querySelector( '.a8c-count' );
}

const RECOMMENDED_BLOGS_LINK = "View list 'Recommended Blogs'";

describe( 'ReaderSidebarLists', () => {
	describe( 'recommended blogs placeholder', () => {
		it( 'hides an empty Recommended Blogs list when it is the only list', () => {
			renderWithProvider(
				<ReaderSidebarLists lists={ [ makeRecommendedBlogsList( [] ) ] } path="/reader" isOpen />
			);

			expect(
				screen.queryByRole( 'link', { name: RECOMMENDED_BLOGS_LINK } )
			).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Create new list' } ) ).toBeInTheDocument();
		} );

		it( 'shows the Recommended Blogs list once it has feeds', () => {
			renderWithProvider(
				<ReaderSidebarLists
					lists={ [ makeRecommendedBlogsList( [ { feed_id: 10, unseen_count: 0 } ] ) ] }
					path="/reader"
					isOpen
				/>
			);

			expect( screen.getByRole( 'link', { name: RECOMMENDED_BLOGS_LINK } ) ).toBeInTheDocument();
		} );

		it( 'shows an empty Recommended Blogs list alongside other lists', () => {
			const lists = [ makeRecommendedBlogsList( [] ), makeList( 1, [] ) ];

			renderWithProvider( <ReaderSidebarLists lists={ lists } path="/reader" isOpen /> );

			expect( screen.getByRole( 'link', { name: RECOMMENDED_BLOGS_LINK } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: "View list 'List 1'" } ) ).toBeInTheDocument();
		} );

		it( "shows another user's empty Recommended Blogs list", () => {
			const lists = [ makeRecommendedBlogsList( [], { owner: 'alice', is_owner: false } ) ];

			renderWithProvider( <ReaderSidebarLists lists={ lists } path="/reader" isOpen /> );

			expect( screen.getByText( 'Recommended Blogs (alice)' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'unseen count', () => {
		it( 'shows no header count when there are no lists', () => {
			const { container } = renderWithProvider(
				<ReaderSidebarLists lists={ [] } path="/reader" isOpen />
			);

			expect( getHeaderCount( container ) ).toBeNull();
		} );

		it( 'shows no header count when no list has unseen items', () => {
			const lists = [ makeList( 1, [ { feed_id: 10, unseen_count: 0 } ] ), makeList( 2, [] ) ];

			const { container } = renderWithProvider(
				<ReaderSidebarLists lists={ lists } path="/reader" isOpen />
			);

			expect( getHeaderCount( container ) ).toBeNull();
		} );

		it( 'sums the unseen count across every list and its feeds', () => {
			const lists = [
				makeList( 1, [
					{ feed_id: 10, unseen_count: 2 },
					{ feed_id: 11, unseen_count: 3 },
				] ),
				makeList( 2, [ { feed_id: 20, unseen_count: 4 } ] ),
			];

			const { container } = renderWithProvider(
				<ReaderSidebarLists lists={ lists } path="/reader" isOpen />
			);

			expect( getHeaderCount( container ) ).toHaveTextContent( '9' );
		} );
	} );

	describe( 'mark all as read', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );
		it( 'marks every feed across all lists as read from the header action', async () => {
			const user = userEvent.setup();
			const lists = [
				makeList( 1, [
					{ feed_id: 10, unseen_count: 2 },
					{ feed_id: 11, unseen_count: 3 },
				] ),
				makeList( 2, [ { feed_id: 20, unseen_count: 4 } ] ),
			];

			renderWithProvider( <ReaderSidebarLists lists={ lists } path="/reader" isOpen /> );

			// The header's "More actions" button is the first one in the DOM,
			// ahead of the per-list actions inside the expandable content.
			await user.click( screen.getAllByRole( 'button', { name: 'More actions' } )[ 0 ] );
			await user.click( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) );

			expect( mockMarkAllAsSeen ).toHaveBeenCalledWith( {
				identifier: '',
				feedIds: [ 10, 11, 20 ],
				feedUrls: [],
			} );
		} );

		it( 'disables the header action when all lists are fully read', async () => {
			const user = userEvent.setup();
			const lists = [ makeList( 1, [ { feed_id: 10, unseen_count: 0 } ] ) ];

			renderWithProvider( <ReaderSidebarLists lists={ lists } path="/reader" isOpen /> );

			await user.click( screen.getAllByRole( 'button', { name: 'More actions' } )[ 0 ] );

			expect( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );
	} );
} );
