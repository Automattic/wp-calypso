/** @jest-environment jsdom */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLoginEmailWrapper } from '../magic-login-email/magic-login-email-wrapper';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/components/async-load', () => () => null );

describe( 'MagicLoginEmailWrapper', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		[ 'Apple', 'person@apple.com', 'https://www.icloud.com' ],
		[ 'Gmail', 'person@gmail.com', 'https://mail.google.com' ],
		[ 'Outlook', 'person@outlook.com', 'https://outlook.live.com' ],
		[ 'Yahoo', 'person@yahoo.com', 'https://mail.yahoo.com' ],
		[ 'AOL', 'person@aol.com', 'https://mail.aol.com' ],
	] )( 'renders a tracked provider link for %s', async ( providerName, emailAddress, href ) => {
		const user = userEvent.setup();
		render( <MagicLoginEmailWrapper emailAddress={ emailAddress } /> );

		const link = screen.getByRole( 'link', { name: `Open in ${ providerName }` } );

		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', href );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noreferrer noopener' );

		await user.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_magic_login_email_click', {
			domain: providerName,
		} );
	} );

	it( 'does not render a provider link for unknown domains', () => {
		const { container } = render( <MagicLoginEmailWrapper emailAddress="person@example.dev" /> );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( container ).toBeEmptyDOMElement();
	} );
} );
