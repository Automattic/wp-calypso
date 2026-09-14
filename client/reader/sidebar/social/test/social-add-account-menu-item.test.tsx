/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SocialAddAccountMenuItem } from '../social-add-account-menu-item';

describe( 'SocialAddAccountMenuItem', () => {
	it( 'renders label and plus icon as a link to href', () => {
		render( <SocialAddAccountMenuItem label="Add account" href="/reader/atmosphere/connect" /> );
		const link = screen.getByRole( 'link', { name: /Add account/ } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/connect' );
	} );

	it( 'fires onClick when link is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render(
			<SocialAddAccountMenuItem
				label="Add account"
				href="/reader/atmosphere/connect"
				onClick={ onClick }
			/>
		);
		await user.click( screen.getByRole( 'link', { name: /Add account/ } ) );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
