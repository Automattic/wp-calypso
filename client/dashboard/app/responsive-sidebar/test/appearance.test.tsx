/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ColorSchemeProvider, PREFERENCE_KEY } from 'calypso/lib/color-scheme';
import { render } from '../../../test-utils';
import SidebarAppearance from '../appearance';

const API_BASE = 'https://public-api.wordpress.com';
const PREFERENCES_PATH = '/rest/v1.1/me/preferences';

function renderAppearance() {
	return render(
		<ColorSchemeProvider>
			<SidebarAppearance />
		</ColorSchemeProvider>,
		{ queryClient }
	);
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( { queries: { retry: false } } );
	document.documentElement.removeAttribute( 'data-theme' );
	nock( API_BASE )
		.get( PREFERENCES_PATH )
		.reply( 200, { calypso_preferences: { [ PREFERENCE_KEY ]: 'light' } } );
} );

afterEach( () => {
	document.documentElement.removeAttribute( 'data-theme' );
} );

test( 'opens appearance from the sidebar and saves the shared account preference', async () => {
	const user = userEvent.setup();
	const save = nock( API_BASE )
		.post( PREFERENCES_PATH, ( body ) => {
			expect( body.calypso_preferences ).toEqual( { [ PREFERENCE_KEY ]: 'dark' } );
			return true;
		} )
		.reply( 200, { calypso_preferences: { [ PREFERENCE_KEY ]: 'dark' } } );
	const { recordTracksEvent } = renderAppearance();

	await user.click( await screen.findByRole( 'button', { name: 'Appearance' } ) );
	expect( await screen.findByRole( 'dialog', { name: 'Appearance' } ) ).toBeVisible();
	await user.click( screen.getByRole( 'radio', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( save.isDone() ).toBe( true );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( screen.getByRole( 'radio', { name: 'Dark' } ) ).toBeChecked();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_color_scheme_change', {
			color_scheme: 'dark',
			previous_color_scheme: 'light',
			source: 'sidebar_appearance',
		} );
	} );
} );

test( 'shows a failed save, restores the previous mode, and allows retrying', async () => {
	const user = userEvent.setup();
	nock( API_BASE ).post( PREFERENCES_PATH ).reply( 500, { error: 'could_not_save_preferences' } );
	const { recordTracksEvent } = renderAppearance();

	await user.click( await screen.findByRole( 'button', { name: 'Appearance' } ) );
	await user.click( await screen.findByRole( 'radio', { name: 'Dark' } ) );
	const dialog = within( screen.getByRole( 'dialog', { name: 'Appearance' } ) );

	expect(
		await dialog.findByText( 'Your appearance setting couldn’t be saved. Please try again.' )
	).toBeVisible();
	expect( screen.getByRole( 'radio', { name: 'Light' } ) ).toBeChecked();
	expect( document.documentElement.dataset.theme ).toBe( 'light' );
	expect( recordTracksEvent ).not.toHaveBeenCalled();

	const retry = nock( API_BASE )
		.post( PREFERENCES_PATH )
		.reply( 200, { calypso_preferences: { [ PREFERENCE_KEY ]: 'dark' } } );
	await user.click( screen.getByRole( 'radio', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( retry.isDone() ).toBe( true );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
	} );
	expect(
		dialog.queryByText( 'Your appearance setting couldn’t be saved. Please try again.' )
	).not.toBeInTheDocument();
} );
