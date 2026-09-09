/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import PreferencesWordPressLabs from '..';
import { render } from '../../../test-utils';

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
} );

function renderWithOptIn( value: 'unset' | 'opt-in' | 'opt-out' = 'unset' ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		'wordpress-labs-opt-in': { value, updated_at: '2026-08-12T00:00:00.000Z' },
	} );

	return render( <PreferencesWordPressLabs />, { queryClient } );
}

test( 'links to the WordPress Labs settings page', async () => {
	renderWithOptIn();

	expect( await screen.findByRole( 'link', { name: /Early access/i } ) ).toHaveAttribute(
		'href',
		'/me/preferences/wordpress-labs'
	);
	expect(
		screen.getByText( 'Opt in for early access to new features and experiments.' )
	).toBeVisible();
} );

test( 'shows a disabled badge when the user has not opted in', async () => {
	renderWithOptIn( 'unset' );

	await waitFor( () => {
		expect( screen.getByText( 'Disabled' ) ).toBeVisible();
	} );
} );

test( 'shows an enabled badge when the user has opted in', async () => {
	renderWithOptIn( 'opt-in' );

	await waitFor( () => {
		expect( screen.getByText( 'Enabled' ) ).toBeVisible();
	} );
} );
