/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CreateListInvitation } from '../index';

describe( 'CreateListInvitation', () => {
	test( 'renders the title', () => {
		renderWithProvider( <CreateListInvitation /> );

		expect( screen.getByRole( 'heading', { name: /create your own list/i } ) ).toBeVisible();
	} );

	test( 'renders the description', () => {
		renderWithProvider( <CreateListInvitation /> );

		expect( screen.getByText( /bundle the blogs you follow/i ) ).toBeVisible();
	} );

	test( 'renders the create button linking to /reader/list/new', () => {
		renderWithProvider( <CreateListInvitation /> );

		const link = screen.getByRole( 'link', { name: /create a list/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/list/new' );
	} );

	test( 'fires onCreateClick when the button is clicked', async () => {
		const user = userEvent.setup();
		const onCreateClick = jest.fn();
		renderWithProvider( <CreateListInvitation onCreateClick={ onCreateClick } /> );

		await user.click( screen.getByRole( 'link', { name: /create a list/i } ) );

		expect( onCreateClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
