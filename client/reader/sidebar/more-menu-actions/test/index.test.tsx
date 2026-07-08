/**
 * @jest-environment jsdom
 */
import { isAutomatticianQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { MoreMenuActions } from '../index';

const mockMarkAllAsSeen = jest.fn();
jest.mock( 'calypso/reader/data/seen-posts', () => ( {
	useMarkAllAsSeenMutation: () => ( { mutate: mockMarkAllAsSeen } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

const defaultProps: ComponentProps< typeof MoreMenuActions > = {
	identifier: 'following',
	feedIds: [ 1, 2 ],
	feedUrls: [ 'https://example.com/feed', 'https://another.example.com/feed' ],
	unseenCount: 3,
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

	test( 'renders the mark all as seen action', async () => {
		const user = userEvent.setup();
		renderMoreMenuActions();

		expect( screen.getByRole( 'button', { name: 'More actions' } ) ).toBeVisible();

		await openMoreActionsMenu( user );

		expect( screen.getByRole( 'menuitem', { name: 'Mark all as seen' } ) ).toBeEnabled();
	} );

	test( 'marks all posts as seen and records the tracks event', async () => {
		const user = userEvent.setup();
		renderMoreMenuActions();

		await openMoreActionsMenu( user );
		await user.click( screen.getByRole( 'menuitem', { name: 'Mark all as seen' } ) );

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

		const markAllAsSeenButton = screen.getByRole( 'menuitem', { name: 'Mark all as seen' } );
		expect( markAllAsSeenButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( markAllAsSeenButton );

		expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalled();
		expect( mockMarkAllAsSeen ).not.toHaveBeenCalled();
	} );
} );
