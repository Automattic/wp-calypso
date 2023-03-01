/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mastodon } from '../mastodon';

const props = {
	service: {
		ID: 'mastodon',
		connect_URL: 'https://testurl.test/?param1=1&param2=2',
	},
	connectAnother: () => {},
	connections: [],
	action: () => {},
	isConnecting: false,
};

describe( 'Mastodon', () => {
	test( 'it displays the input form without errors', () => {
		render( <Mastodon { ...props } /> );

		const input = screen.getByLabelText( 'Enter your Mastodon username' );
		expect( input ).toBeInTheDocument();

		const btn = screen.getByRole( 'button', { name: /Connect account/i } );
		expect( btn ).toBeInTheDocument();
		expect( btn ).toBeDisabled();
	} );

	test( 'displays an error message when instance is invalid', async () => {
		const { container } = render( <Mastodon { ...props } /> );

		await userEvent.type(
			screen.getByLabelText( 'Enter your Mastodon username' ),
			'invalid instance'
		);

		// error message is displayed
		expect( screen.getByRole( 'alert' ) ).toBeInTheDocument();

		// spinner is shown
		expect( container.getElementsByClassName( 'spinner' ).length ).toBe( 1 );

		const btn = screen.getByRole( 'button', { name: /Connect account/i } );
		expect( btn ).toBeDisabled();
	} );

	test( 'enable connect button when instance is valid', async () => {
		render( <Mastodon { ...props } /> );

		await userEvent.type(
			screen.getByLabelText( 'Enter your Mastodon username' ),
			'user@example.com'
		);

		const btn = screen.getByRole( 'button', { name: /Connect account/i } );
		expect( btn ).toBeEnabled();
	} );

	test( 'reset error message and hide spinner when instance is valid', async () => {
		const { container } = render( <Mastodon { ...props } /> );

		await userEvent.type(
			screen.getByLabelText( 'Enter your Mastodon username' ),
			'invaliduser@instance'
		);

		await userEvent.type(
			screen.getByLabelText( 'Enter your Mastodon username' ),
			'user@example.com'
		);

		expect( screen.queryByRole( 'alert' ) ).toBeNull();
		expect( container.getElementsByClassName( 'spinner' ).length ).toBe( 0 );
	} );

	test( 'reset error message and hide spinner when instance is empty', async () => {
		const { container } = render( <Mastodon { ...props } /> );

		await userEvent.type(
			screen.getByLabelText( 'Enter your Mastodon username' ),
			'invalid email'
		);

		await userEvent.clear( screen.getByLabelText( 'Enter your Mastodon username' ) );

		expect( screen.queryByRole( 'alert' ) ).toBeNull();
		expect( container.getElementsByClassName( 'spinner' ).length ).toBe( 0 );
	} );
} );
