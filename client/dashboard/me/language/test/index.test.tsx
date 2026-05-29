/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import Language from '../index';

const renderWithUserData = ( userData = {} ) => {
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	const result = render( <Language /> );

	result.queryClient.setQueryData( [ 'user-settings-preferences' ], userData );

	return result;
};

describe( '<Language />', () => {
	describe( 'Field visibility logic', () => {
		test( 'renders basic interface elements', async () => {
			renderWithUserData( {
				language: 'pt',
				use_fallback_for_incomplete_languages: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeVisible();
			} );
			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
		} );

		test( 'shows fallback field for incomplete language (Portuguese)', async () => {
			renderWithUserData( {
				language: 'pt',
				use_fallback_for_incomplete_languages: false,
			} );
			await waitFor( () => {
				expect( screen.getByText( 'Display interface in English' ) ).toBeVisible();
			} );
		} );

		test( 'hides fallback field for complete language (English)', async () => {
			renderWithUserData( {
				language: 'en',
				use_fallback_for_incomplete_languages: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeVisible();
			} );
			expect( screen.queryByText( 'Display interface in English' ) ).not.toBeInTheDocument();
		} );

		test( 'shows enable_translator field for translatable language (Spanish)', async () => {
			renderWithUserData( {
				language: 'es',
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Enable the in-page translator where available' ) ).toBeVisible();
			} );
		} );

		test( 'hides enable_translator field for non-translatable language (English)', async () => {
			renderWithUserData( {
				language: 'en',
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Interface language' ) ).toBeVisible();
			} );

			expect(
				screen.queryByText( 'Enable the in-page translator where available' )
			).not.toBeInTheDocument();
		} );
	} );
} );
