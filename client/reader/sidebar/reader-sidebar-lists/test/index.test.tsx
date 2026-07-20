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

function makeList( ID: number, feeds: { feed_id: number; unseen_count: number }[] ): ReadList {
	return {
		ID,
		slug: `list-${ ID }`,
		owner: 'bob',
		title: `List ${ ID }`,
		description: '',
		is_owner: true,
		is_public: true,
		feeds,
	};
}

// The Count exposes no role/label, so scope to the header's own count element,
// separate from the per-list counts rendered inside the expandable content.
function getHeaderCount( container: HTMLElement ): HTMLElement | null {
	return container.querySelector( '.a8c-count' );
}

describe( 'ReaderSidebarLists', () => {
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

	describe( 'mark all as seen', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );
		it( 'marks every feed across all lists as seen from the header action', async () => {
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
			await user.click( screen.getByRole( 'menuitem', { name: 'Mark all as seen' } ) );

			expect( mockMarkAllAsSeen ).toHaveBeenCalledWith( {
				identifier: 'sidebar-lists',
				feedIds: [ 10, 11, 20 ],
				feedUrls: [],
			} );
		} );

		it( 'disables the header action when all lists are fully seen', async () => {
			const user = userEvent.setup();
			const lists = [ makeList( 1, [ { feed_id: 10, unseen_count: 0 } ] ) ];

			renderWithProvider( <ReaderSidebarLists lists={ lists } path="/reader" isOpen /> );

			await user.click( screen.getAllByRole( 'button', { name: 'More actions' } )[ 0 ] );

			expect( screen.getByRole( 'menuitem', { name: 'Mark all as seen' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );
	} );
} );
