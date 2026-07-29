/**
 * @jest-environment jsdom
 */
import { isAutomatticianQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import MoreMenuActions from '../index';

const mockMarkAllAsSeen = jest.fn();
jest.mock( 'calypso/reader/data/seen-posts', () => ( {
	useMarkAllAsSeenMutation: () => ( { mutate: mockMarkAllAsSeen } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

const mockUnsubscribeWithUndo = jest.fn();
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useUnsubscribeWithUndo: () => mockUnsubscribeWithUndo,
} ) );

const defaultProps: ComponentProps< typeof MoreMenuActions > = {
	identifier: 'following',
	isSingleFeed: false,
	feedIds: [ 1, 2 ],
	feedUrls: [ 'https://example.com/feed', 'https://another.example.com/feed' ],
	unseenCount: 3,
};

const singleFeedProps = {
	isSingleFeed: true,
	feedIds: [ 1 ],
	feedUrls: [ 'https://example.com/feed' ],
	blogId: 42,
	siteName: 'Example Blog',
	source: 'recent',
};

function renderMoreMenuActions( props = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );

	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: 1,
		teams: [ { slug: 'a8c', title: 'Automattic' } ],
	} );

	return render(
		<QueryClientProvider client={ queryClient }>
			<MoreMenuActions { ...defaultProps } { ...props } />
		</QueryClientProvider>
	);
}

async function openMoreActionsMenu( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( screen.getByRole( 'button', { name: 'More actions' } ) );
}

describe( 'MoreMenuActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the mark all as read action', async () => {
		const user = userEvent.setup();
		renderMoreMenuActions();

		expect( screen.getByRole( 'button', { name: 'More actions' } ) ).toBeVisible();

		await openMoreActionsMenu( user );

		expect( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) ).toBeEnabled();
	} );

	test( 'marks all posts as seen and records the tracks event', async () => {
		const user = userEvent.setup();
		renderMoreMenuActions();

		await openMoreActionsMenu( user );
		await user.click( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_mark_all_as_seen_clicked',
			{ source: defaultProps.identifier }
		);
		expect( mockMarkAllAsSeen ).toHaveBeenCalledWith( {
			identifier: defaultProps.identifier,
			feedIds: defaultProps.feedIds,
			feedUrls: defaultProps.feedUrls,
		} );
	} );

	test( 'disables the action when there are no unseen posts', async () => {
		const user = userEvent.setup();
		renderMoreMenuActions( { unseenCount: 0 } );

		await openMoreActionsMenu( user );

		const markAllAsSeenButton = screen.getByRole( 'menuitem', { name: 'Mark all as read' } );
		expect( markAllAsSeenButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( markAllAsSeenButton );

		expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalled();
		expect( mockMarkAllAsSeen ).not.toHaveBeenCalled();
	} );

	describe( 'action title', () => {
		test( 'uses the plural title when isSingleFeed is false', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( { isSingleFeed: false } );

			await openMoreActionsMenu( user );

			expect( screen.getByRole( 'menuitem', { name: 'Mark all as read' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'menuitem', { name: 'Mark as read' } ) ).not.toBeInTheDocument();
		} );

		test( 'uses the singular title when isSingleFeed is true', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( { isSingleFeed: true } );

			await openMoreActionsMenu( user );

			expect( screen.getByRole( 'menuitem', { name: 'Mark as read' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'menuitem', { name: 'Mark all as read' } )
			).not.toBeInTheDocument();
		} );

		test( 'defaults to the singular title when isSingleFeed is not provided', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( { isSingleFeed: undefined } );

			await openMoreActionsMenu( user );

			expect( screen.getByRole( 'menuitem', { name: 'Mark as read' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'menuitem', { name: 'Mark all as read' } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'unsubscribe', () => {
		test( 'renders the action for a single feed', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( singleFeedProps );

			await openMoreActionsMenu( user );

			expect( screen.getByRole( 'menuitem', { name: 'Unsubscribe' } ) ).toBeEnabled();
		} );

		test( 'is hidden on a section header', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( { ...singleFeedProps, isSingleFeed: false } );

			await openMoreActionsMenu( user );

			expect( screen.queryByRole( 'menuitem', { name: 'Unsubscribe' } ) ).not.toBeInTheDocument();
		} );

		test( 'is hidden when there is no feed URL', async () => {
			const user = userEvent.setup();
			renderMoreMenuActions( { ...singleFeedProps, feedUrls: [] } );

			await openMoreActionsMenu( user );

			expect( screen.queryByRole( 'menuitem', { name: 'Unsubscribe' } ) ).not.toBeInTheDocument();
		} );

		test( 'unsubscribes the feed and notifies the host', async () => {
			const user = userEvent.setup();
			const onUnsubscribed = jest.fn();
			renderMoreMenuActions( { ...singleFeedProps, onUnsubscribed } );

			await openMoreActionsMenu( user );
			await user.click( screen.getByRole( 'menuitem', { name: 'Unsubscribe' } ) );

			expect( mockUnsubscribeWithUndo ).toHaveBeenCalledWith( {
				feedUrl: singleFeedProps.feedUrls[ 0 ],
				blogId: singleFeedProps.blogId,
				siteName: singleFeedProps.siteName,
				source: singleFeedProps.source,
			} );
			expect( onUnsubscribed ).toHaveBeenCalled();
		} );
	} );
} );
