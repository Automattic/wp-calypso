/** @jest-environment jsdom */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLoginEmailButton } from '../magic-login-email/magic-login-email-wrapper';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'MagicLoginEmailButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'links to the inbox of a known email provider in a new tab', () => {
		render( <MagicLoginEmailButton emailAddress="person@gmail.com" /> );

		const link = screen.getByRole( 'link', { name: 'Open in Gmail' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://mail.google.com' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'renders nothing for an unknown email provider', () => {
		const { container } = render( <MagicLoginEmailButton emailAddress="person@example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing without an email address', () => {
		const { container } = render( <MagicLoginEmailButton emailAddress={ null } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'records the provider when the link is clicked', async () => {
		render( <MagicLoginEmailButton emailAddress="person@gmail.com" /> );

		await userEvent.click( screen.getByRole( 'link', { name: 'Open in Gmail' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_magic_login_email_click', {
			domain: 'Gmail',
		} );
	} );
} );
