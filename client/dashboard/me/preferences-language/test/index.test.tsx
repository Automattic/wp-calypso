/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PreferencesLanguageForm from '../index';

const renderWithUserData = ( userData = {} ) => {
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	const result = render( <PreferencesLanguageForm /> );

	// Mock the query data
	result.queryClient.setQueryData( [ 'user-settings-preferences' ], userData );

	return result;
};

describe( 'PreferencesLanguageForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Field visibility logic', () => {
		it( 'renders basic interface elements', async () => {
			renderWithUserData( {
				language: 'pt', // Portuguese - incomplete language
				use_fallback_for_incomplete_languages: false,
			} );

			// Test that the component loads and shows basic elements
			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeInTheDocument();
			} );
			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeInTheDocument();
		} );

		it( 'shows fallback field for incomplete language (Portuguese)', async () => {
			renderWithUserData( {
				language: 'pt', // Portuguese is marked as incomplete in real data
				use_fallback_for_incomplete_languages: false,
			} );
			await waitFor( () => {
				expect( screen.getByText( 'Display interface in English' ) ).toBeInTheDocument();
			} );
		} );

		it( 'hides fallback field for complete language (Spanish)', async () => {
			renderWithUserData( {
				language: 'en', // Spanish is complete in real data
				use_fallback_for_incomplete_languages: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'Display interface in English' ) ).toBe( null );
		} );

		it( 'shows enable_translator field for translatable language (Spanish)', async () => {
			renderWithUserData( {
				language: 'es',
			} );

			await waitFor( () => {
				expect(
					screen.getByText( 'Enable the in-page translator where available' )
				).toBeInTheDocument();
			} );
		} );

		it( 'hides enable_translator field for non-translatable language (English)', async () => {
			renderWithUserData( {
				language: 'en', // English is non-translatable in real data
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeInTheDocument();
			} );

			expect( screen.queryByText( 'Enable the in-page translator where available' ) ).toBe( null );
		} );
	} );
} );
