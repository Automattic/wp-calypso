/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InviteFormHeaderLoggedOut from '../invite-form-header-logged-out';

const mockGetPartnerSignupTosElement = vi.fn();

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url ) => url,
} ) );

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate:
			() =>
			( text, options = {} ) => {
				const args = options.args || {};
				return Object.entries( args ).reduce(
					( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
					text
				);
			},
	} )
);

vi.mock( 'calypso/lib/partner-branding', () => ( {
	getPartnerSignupTosElement: ( ...args ) => mockGetPartnerSignupTosElement( ...args ),
} ) );

describe( 'InviteFormHeaderLoggedOut', () => {
	beforeEach( () => {
		vi.clearAllMocks();
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
				partnerConfig={ { id: 'woo' } }
			/>
		);

		expect( screen.getByText( 'Partner ToS Copy' ) ).toBeVisible();
		expect( mockGetPartnerSignupTosElement ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'woo' } ),
			expect.any( Function )
		);
	} );
} );
