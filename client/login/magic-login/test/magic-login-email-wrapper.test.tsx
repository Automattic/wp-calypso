/** @jest-environment jsdom */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MagicLoginEmailWrapper } from '../magic-login-email/magic-login-email-wrapper';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	extractDomainWithExtension: ( email: string ) => email.split( '@' )[ 1 ],
} ) );

jest.mock( 'calypso/components/async-load', () => () => null );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( component: React.ComponentType ) => component,
	useTranslate: () => ( text: string, options?: { args?: Record< string, string > } ) =>
		text.replace( '%(mailProviderName)s', options?.args?.mailProviderName ?? '' ),
} ) );

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
	] )( 'renders a tracked Core Button link for %s', ( providerName, emailAddress, href ) => {
		render( <MagicLoginEmailWrapper emailAddress={ emailAddress } /> );

		const link = screen.getByRole( 'link', { name: `Open in ${ providerName }` } );

		expect( link ).toHaveAttribute( 'href', href );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noreferrer noopener' );
		expect( link ).toHaveClass( 'components-button', 'is-secondary' );

		fireEvent.click( link );

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
