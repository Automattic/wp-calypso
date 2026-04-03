/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PreferencesLanguage from '../index';

const renderWithUserData = ( userData = {} ) => {
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	const result = render( <PreferencesLanguage /> );

	result.queryClient.setQueryData( [ 'user-settings-preferences' ], userData );

	return result;
};

describe( '<PreferencesLanguage />', () => {
	test( 'renders the language link card with title and description', async () => {
		renderWithUserData( { language: 'en' } );

		await waitFor( () => {
			expect( screen.getByRole( 'link', { name: /Language/i } ) ).toBeVisible();
		} );
		expect( screen.getByText( 'Set the display language for WordPress.com.' ) ).toBeVisible();
	} );

	test( 'shows the current language name as a badge', async () => {
		renderWithUserData( { language: 'es' } );

		await waitFor( () => {
			expect( screen.getByText( 'Español' ) ).toBeVisible();
		} );
	} );

	test( 'links to the language sub-page', async () => {
		renderWithUserData( { language: 'en' } );

		await waitFor( () => {
			const link = screen.getByRole( 'link', { name: /Language/i } );
			expect( link ).toHaveAttribute( 'href', '/me/preferences/language' );
		} );
	} );
} );
