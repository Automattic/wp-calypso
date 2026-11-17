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
	default: ( { onOpenFullView }: { onOpenFullView?: () => void } ) => (
		<div role="region" aria-label="Notifications panel">
			{ onOpenFullView && <button onClick={ onOpenFullView }>Open full view</button> }
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
	test( 'offers the full view from the panel', async () => {
		const user = userEvent.setup();
		const onOpenInbox = vi.fn();
		render( <Notifications onOpenInbox={ onOpenInbox } /> );

		await openPanel( user );
		await user.click( await screen.findByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenInbox ).toHaveBeenCalledTimes( 1 );
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

	test( 'keeps the panel closed while the inbox is shown', async () => {
		const user = userEvent.setup();
		render( <Notifications isInboxShown onOpenInbox={ () => {} } /> );

		await openPanel( user );

		expect(
			screen.queryByRole( 'region', { name: 'Notifications panel' } )
		).not.toBeInTheDocument();
	} );
} );
