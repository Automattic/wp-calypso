import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';
import { recordTracksEvent } from '../../../panel/helpers/stats';
import { init as initWpcom } from '../../../panel/rest-client/wpcom';
import { store } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import NodePanel, { getNotificationTabs } from '../index';
import type { FilterName } from '../../types';
import type { ComponentProps } from 'react';

vi.mock( '../../../panel/helpers/stats', () => ( { recordTracksEvent: vi.fn() } ) );

const noop = () => {};

const defaultProps = {
	filterName: 'all' as FilterName,
	setFilterName: noop,
	selectedNoteId: undefined,
	setSelectedNoteId: noop,
};

// Copied from https://github.com/WordPress/gutenberg/blob/adf3ef6d41df4e70f283a35f552631668131dd95/packages/components/src/tabs/test/index.tsx#L181.
async function waitForComponentToBeInitializedWithSelectedTab(
	selectedTabName: string | undefined
) {
	if ( ! selectedTabName ) {
		// Wait for the tablist to be tabbable as a mean to know
		// that ariakit has finished initializing.
		await waitFor( () =>
			expect( screen.getByRole( 'tablist' ) ).toHaveAttribute(
				'tabindex',
				expect.stringMatching( /^(0|-1)$/ )
			)
		);
		// No initially selected tabs or tabpanels.
		await waitFor( () =>
			expect( screen.queryByRole( 'tab', { selected: true } ) ).not.toBeInTheDocument()
		);
	} else {
		// Waiting for a tab to be selected is a sign that the component
		// has fully initialized.
		expect(
			await screen.findByRole( 'tab', {
				selected: true,
				name: selectedTabName,
			} )
		).toBeVisible();
	}
}

describe( 'NotePanel', () => {
	it( 'should render correctly', async () => {
		const { getByText } = renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		getNotificationTabs().forEach( ( { title }: { title: string } ) => {
			expect( getByText( title ) ).toBeInTheDocument();
		} );
	} );

	it( 'should select tab on click', async () => {
		const ControlledPanel = () => {
			const [ filterName, setFilterName ] = useState< FilterName >( 'all' );
			return (
				<NodePanel
					filterName={ filterName }
					setFilterName={ setFilterName }
					selectedNoteId={ undefined }
					setSelectedNoteId={ noop }
				/>
			);
		};
		renderWithProvider( <ControlledPanel /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		const nextSelectedTab = getNotificationTabs()[ 1 ];
		await userEvent.click( screen.getByRole( 'tab', { name: nextSelectedTab.title } ) );
		await waitFor( () =>
			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: nextSelectedTab.title,
				} )
			).toBeVisible()
		);
	} );

	it( 'offers the full view when the host provides one', async () => {
		const onOpenFullView = vi.fn();
		renderWithProvider(
			<AppProvider client={ null } locale="en" onOpenFullView={ onOpenFullView }>
				<NodePanel { ...defaultProps } />
			</AppProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenFullView ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens the full view on the selected tab and records the click', async () => {
		const onOpenFullView = vi.fn();
		renderWithProvider(
			<AppProvider client={ null } locale="en" onOpenFullView={ onOpenFullView }>
				<NodePanel { ...defaultProps } filterName="unread" />
			</AppProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenFullView ).toHaveBeenCalledWith( { filterName: 'unread', noteId: undefined } );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_notification_full_view_click', {
			tab: 'unread',
			is_note_open: false,
		} );
	} );

	it( 'has no full view button when the host provides none', async () => {
		renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
	} );

	it( 'titles the panel with a third-level heading and shows its header actions by default', async () => {
		renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.getByRole( 'heading', { name: 'Notifications', level: 3 } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Keyboard shortcuts' } ) ).toBeVisible();
	} );

	it( 'can title a page and take other header actions', async () => {
		renderWithProvider(
			<NodePanel
				{ ...defaultProps }
				headingLevel={ 1 }
				actions={ <button>Leave feedback</button> }
			/>
		);

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.getByRole( 'heading', { name: 'Notifications', level: 1 } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Leave feedback' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Keyboard shortcuts' } )
		).not.toBeInTheDocument();
	} );

	describe( 'with unread notifications', () => {
		const unreadNote = {
			id: 5,
			type: 'comment',
			read: 0,
			timestamp: '2026-06-05T00:00:00+00:00',
			subject: [ { text: 'An unread comment' } ],
			body: [],
		};

		const renderPanel = ( props: Partial< ComponentProps< typeof NodePanel > > ) => {
			initWpcom( { req: { get: async () => ( { notes: [ { id: unreadNote.id } ] } ) } } );
			renderWithProvider( <NodePanel { ...defaultProps } { ...props } /> );
			act( () => {
				store.dispatch( actions.notes.addNotes( [ unreadNote ] ) );
				store.dispatch( actions.ui.loadedNotes() );
			} );
		};

		it.each( [ 'all', 'unread' ] as const )(
			'offers to mark them all as read on the "%s" tab when the host asks for it',
			async ( filterName ) => {
				renderPanel( { showMarkAllAsRead: true, filterName } );

				expect( await screen.findByRole( 'button', { name: 'Mark 1 as read' } ) ).toBeVisible();
			}
		);

		it( 'does not offer it on a tab that lists only some of them', async () => {
			renderPanel( { showMarkAllAsRead: true, filterName: 'comments' } );

			await screen.findByRole( 'tab', { name: 'Comments', selected: true } );
			expect( screen.queryByRole( 'button', { name: /as read$/ } ) ).not.toBeInTheDocument();
		} );

		it( 'does not offer it unless the host asks for it', async () => {
			renderPanel( {} );

			expect( await screen.findByText( 'An unread comment' ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /as read$/ } ) ).not.toBeInTheDocument();
		} );
	} );
} );
