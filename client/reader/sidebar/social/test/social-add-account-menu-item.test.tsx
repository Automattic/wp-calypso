/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SocialAddAccountMenuItem } from '../social-add-account-menu-item';

describe( 'SocialAddAccountMenuItem', () => {
	it( 'renders label and plus icon as a link to href', () => {
		render( <SocialAddAccountMenuItem label="Add account" href="/reader/atmosphere/connect" /> );
		const link = screen.getByRole( 'link', { name: /Add account/ } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/connect' );
	} );
} );
