/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import InviteFormHeaderLoggedOut from '../invite-form-header-logged-out';

const mockGetPartnerSignupTosElement = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url ) => url,
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate:
		() =>
		( text, options = {} ) => {
			const args = options.args || {};
			return Object.entries( args ).reduce(
				( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
				text
			);
		},
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	getPartnerSignupTosElement: ( ...args ) => mockGetPartnerSignupTosElement( ...args ),
} ) );

describe( 'InviteFormHeaderLoggedOut', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetPartnerSignupTosElement.mockReturnValue( undefined );
	} );

	it( 'renders a same-tab title link to the invited site', () => {
		render(
			<InviteFormHeaderLoggedOut
				site={ {
					title: 'Example Blog',
					URL: 'https://example.blog',
				} }
			/>
		);

		const siteLink = screen.getByRole( 'link', { name: 'Example Blog' } );

		expect( siteLink ).toHaveAttribute( 'href', 'https://example.blog' );
		expect( siteLink ).not.toHaveAttribute( 'target' );
	} );

	it( 'uses partner ToS copy when a CIAB config is provided', () => {
		mockGetPartnerSignupTosElement.mockReturnValue( <span>Partner ToS Copy</span> );

		render(
			<InviteFormHeaderLoggedOut
				site={ {
					title: 'Woo Store',
					URL: 'https://woo.store',
				} }
				ciabConfig={ { id: 'woo' } }
			/>
		);

		expect( screen.getByText( 'Partner ToS Copy' ) ).toBeVisible();
		expect( mockGetPartnerSignupTosElement ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'woo' } ),
			expect.any( Function )
		);
	} );
} );
