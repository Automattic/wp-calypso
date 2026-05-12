/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkButton from '../index';

describe( 'LinkButton', () => {
	test( 'renders its children', () => {
		render( <LinkButton>Lost your password?</LinkButton> );

		expect( screen.getByRole( 'button', { name: 'Lost your password?' } ) ).toBeVisible();
	} );

	test( 'fires onClick when pressed', async () => {
		const onClick = jest.fn();
		render( <LinkButton onClick={ onClick }>Lost your password?</LinkButton> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Lost your password?' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders as a link when href is present', () => {
		render( <LinkButton href="/log-in/lostpassword">Lost your password?</LinkButton> );

		const link = screen.getByRole( 'link', { name: 'Lost your password?' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', '/log-in/lostpassword' );
	} );
} );
