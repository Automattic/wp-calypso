/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import Notifications from '../index';

// The panel starts a notifications client that polls the API and opens a websocket.
vi.mock( '@automattic/notifications/src/app', () => ( {
	default: ( {
		onOpenFullView,
	}: {
		onOpenFullView?: ( view: { filterName: string; noteId?: string } ) => void;
	} ) => (
		<div role="region" aria-label="Notifications panel">
			<button>Panel note</button>
			{ onOpenFullView && (
				<button onClick={ () => onOpenFullView( { filterName: 'unread', noteId: '42' } ) }>
					Open full view
				</button>
			) }
		</div>
	),
} ) );
vi.mock( '@automattic/notifications/src/app/client', () => ( {
	subscribeUnseenCount: () => () => {},
} ) );

const openPanel = async ( user: ReturnType< typeof userEvent.setup > ) => {
	await user.click( screen.getByRole( 'button', { name: 'Notifications' } ) );
};

describe( '<Notifications> with the inbox', () => {
	test( 'opens the full view on what the panel is showing', async () => {
		const user = userEvent.setup();
		const onOpenInbox = vi.fn();
		render( <Notifications onOpenInbox={ onOpenInbox } /> );

		await openPanel( user );
		await user.click( await screen.findByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenInbox ).toHaveBeenCalledTimes( 1 );
		expect( onOpenInbox ).toHaveBeenCalledWith( { filterName: 'unread', noteId: '42' } );
	} );

	test( 'has no full view button without an inbox to open', async () => {
		const user = userEvent.setup();
		render( <Notifications /> );

		await openPanel( user );

		// The popover fades in, so it is in the document before it is visible.
		await waitFor( () =>
			expect( screen.getByRole( 'region', { name: 'Notifications panel' } ) ).toBeVisible()
		);
		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
	} );

	test( 'opens the panel while the inbox is shown, without a full view button', async () => {
		const user = userEvent.setup();
		render( <Notifications isInboxShown onOpenInbox={ () => {} } /> );

		await openPanel( user );

		await waitFor( () =>
			expect( screen.getByRole( 'region', { name: 'Notifications panel' } ) ).toBeVisible()
		);
		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
	} );

	test( 'closes the panel when the focus moves on from the omnibar into the page', async () => {
		const user = userEvent.setup();
		render(
			<>
				<div id="wpcom-omnibar">
					<button>Omnibar menu</button>
				</div>
				<button>Note row</button>
				<Notifications isInboxShown onOpenInbox={ () => {} } />
			</>
		);

		await openPanel( user );
		await waitFor( () =>
			expect( screen.getByRole( 'region', { name: 'Notifications panel' } ) ).toBeVisible()
		);
		await user.click( screen.getByRole( 'button', { name: 'Omnibar menu' } ) );

		expect( screen.getByRole( 'region', { name: 'Notifications panel' } ) ).toBeVisible();

		await user.tab();

		await waitFor( () =>
			expect(
				screen.queryByRole( 'region', { name: 'Notifications panel' } )
			).not.toBeInTheDocument()
		);
		expect( screen.getByRole( 'button', { name: 'Note row' } ) ).toHaveFocus();
	} );

	test( 'closes the panel on a click on text in the page after the omnibar', async () => {
		const user = userEvent.setup();
		render(
			<>
				<div id="wpcom-omnibar">
					<button>Omnibar menu</button>
				</div>
				<p>Comment text</p>
				<Notifications isInboxShown onOpenInbox={ () => {} } />
			</>
		);

		await openPanel( user );
		await waitFor( () =>
			expect( screen.getByRole( 'region', { name: 'Notifications panel' } ) ).toBeVisible()
		);
		await user.click( screen.getByRole( 'button', { name: 'Omnibar menu' } ) );
		await user.click( screen.getByText( 'Comment text' ) );

		await waitFor( () =>
			expect(
				screen.queryByRole( 'region', { name: 'Notifications panel' } )
			).not.toBeInTheDocument()
		);
	} );

	test( 'keeps the panel open over the page while the focus is in it, its menus or a dialog', async () => {
		const user = userEvent.setup();
		render(
			<>
				<div id="wpcom-omnibar">
					<button>Omnibar menu</button>
				</div>
				<div className="components-popover">
					<button>Menu item</button>
				</div>
				<div role="dialog" aria-label="Command palette">
					<button>Palette item</button>
				</div>
				<div className="components-modal__screen-overlay">Dialog overlay</div>
				<Notifications isInboxShown onOpenInbox={ () => {} } />
			</>
		);

		await openPanel( user );
		const panel = screen.getByRole( 'region', { name: 'Notifications panel' } );
		await waitFor( () => expect( panel ).toBeVisible() );
		await user.click( screen.getByRole( 'button', { name: 'Panel note' } ) );
		// From the omnibar, the panel's own check for focus moving out of it doesn't run.
		await user.click( screen.getByRole( 'button', { name: 'Omnibar menu' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Menu item' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Palette item' } ) );
		await user.click( screen.getByText( 'Dialog overlay' ) );

		expect( panel ).toBeVisible();
	} );
} );
