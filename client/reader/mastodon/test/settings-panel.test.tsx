/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SettingsPanel } from '../settings-panel';

describe( 'SettingsPanel', () => {
	it( 'renders a placeholder heading and copy', () => {
		renderWithProvider( <SettingsPanel /> );

		expect( screen.getByRole( 'heading', { name: /settings/i } ) ).toBeVisible();
		expect( screen.getByText( /still building this part/i ) ).toBeVisible();
	} );
} );
