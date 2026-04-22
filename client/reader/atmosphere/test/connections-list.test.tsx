/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionsList } from '../connections-list';

describe( 'ConnectionsList', () => {
	it( 'renders empty state with no connections', () => {
		render( <ConnectionsList connections={ [] } isLoading={ false } onVerify={ jest.fn() } /> );
		expect( screen.getByText( /no bluesky accounts connected yet/i ) ).toBeVisible();
	} );

	it( 'marks the list as busy while loading', () => {
		render( <ConnectionsList connections={ [] } isLoading onVerify={ jest.fn() } /> );
		expect( screen.getByRole( 'list' ) ).toHaveAttribute( 'aria-busy', 'true' );
	} );

	it( 'renders a card per connection with handle and a Verify button', async () => {
		const user = userEvent.setup();
		const onVerify = jest.fn();
		render(
			<ConnectionsList
				connections={ [ { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null } ] }
				isLoading={ false }
				onVerify={ onVerify }
			/>
		);
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible();
		await user.click( screen.getByRole( 'button', { name: /verify/i } ) );
		expect( onVerify ).toHaveBeenCalledWith( 101 );
	} );
} );
