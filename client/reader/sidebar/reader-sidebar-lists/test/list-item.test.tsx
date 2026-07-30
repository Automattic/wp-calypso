/**
 * @jest-environment jsdom
 */
import { ReadList } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarListsListItem from '../list-item';

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

const list: ReadList = {
	ID: 123,
	slug: 'favorites',
	owner: 'bob',
	title: 'Favorites',
	description: '',
	is_owner: true,
	is_public: true,
	feeds: [],
};

describe( 'ReaderSidebarListsListItem', () => {
	let scrollIntoView: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		// jsdom does not implement scrollIntoView.
		scrollIntoView = jest.fn();
		window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
	} );

	it( 'renders the list link', () => {
		renderWithProvider( <ReaderSidebarListsListItem list={ list } path="/reader" /> );

		expect( screen.getByRole( 'link', { name: /Favorites/ } ) ).toBeVisible();
	} );

	it( 'scrolls the current list into view on mount', () => {
		// Regression test: the item ref must resolve to the rendered `li` DOM
		// node (MenuItem forwards its ref) for scrollIntoView to be reachable.
		renderWithProvider(
			<ReaderSidebarListsListItem
				list={ list }
				path="/reader"
				currentListSlug="favorites"
				currentListOwner="bob"
			/>
		);

		expect( scrollIntoView ).toHaveBeenCalled();
	} );

	it( 'does not scroll when the list is not the current list', () => {
		renderWithProvider(
			<ReaderSidebarListsListItem
				list={ list }
				path="/reader"
				currentListSlug="other"
				currentListOwner="bob"
			/>
		);

		expect( scrollIntoView ).not.toHaveBeenCalled();
	} );

	describe( 'unseen count', () => {
		it( 'does not show a count when the list has no feeds', () => {
			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ { ...list, feeds: [] } } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toBeNull();
		} );

		it( 'does not show a count when every feed is fully read', () => {
			const listNoUnseen: ReadList = {
				...list,
				feeds: [
					{ feed_id: 1, unseen_count: 0 },
					{ feed_id: 2, unseen_count: 0 },
				],
			};

			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ listNoUnseen } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toBeNull();
		} );

		it( 'shows the unseen count summed across the list feeds', () => {
			const listWithUnseen: ReadList = {
				...list,
				feeds: [
					{ feed_id: 1, unseen_count: 2 },
					{ feed_id: 2, unseen_count: 3 },
				],
			};

			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ listWithUnseen } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toHaveTextContent( '5' );
		} );
	} );

	describe( 'mark all as read', () => {
		const listWithUnseen: ReadList = {
			...list,
			feeds: [
				{ feed_id: 1, unseen_count: 2 },
				{ feed_id: 2, unseen_count: 3 },
			],
		};

		it( 'marks the list feeds as read', async () => {
			const user = userEvent.setup();
			renderWithProvider( <ReaderSidebarListsListItem list={ listWithUnseen } path="/reader" /> );

			await user.click( screen.getByRole( 'button', { name: 'More actions' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) );

			expect( mockMarkAllAsSeen ).toHaveBeenCalledWith( {
				identifier: 'sidebar-list',
				feedIds: [ 1, 2 ],
				feedUrls: [],
			} );
		} );

		it( 'disables the action when the list is fully read', async () => {
			const user = userEvent.setup();
			renderWithProvider(
				<ReaderSidebarListsListItem
					list={ {
						...list,
						feeds: [
							{ feed_id: 1, unseen_count: 0 },
							{ feed_id: 2, unseen_count: 0 },
						],
					} }
					path="/reader"
				/>
			);

			await user.click( screen.getByRole( 'button', { name: 'More actions' } ) );

			expect( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );
	} );
} );
