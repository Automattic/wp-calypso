/**
 * @jest-environment jsdom
 */

import {
	isAutomatticianQuery,
	queryClient,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import PreferencesReader from '..';
import { render } from '../../../test-utils';

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
} );

function seedTeams( isAutomattician: boolean ) {
	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: isAutomattician ? 1 : 0,
		teams: isAutomattician ? [ { slug: 'a8c', title: 'Automattic' } ] : [],
	} );
}

function seedSeenPostsPreference( enabled?: boolean ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		...( enabled === undefined ? {} : { 'reader-seen-posts': enabled } ),
	} );
}

describe( '<PreferencesReader>', () => {
	test( 'hides the summary when seen posts is not available', async () => {
		seedTeams( false );
		seedSeenPostsPreference( true );

		const { container } = render( <PreferencesReader />, { queryClient } );

		await waitFor( () => {
			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	test( 'links to the Reader preferences page when seen posts is available', async () => {
		seedTeams( true );
		seedSeenPostsPreference( true );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByRole( 'link', { name: /Reader/i } ) ).toHaveAttribute(
			'href',
			'/me/preferences/reader'
		);
	} );

	test( 'shows a read-status-on badge when the preference is enabled', async () => {
		seedTeams( true );
		seedSeenPostsPreference( true );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status on' ) ).toBeVisible();
	} );

	test( 'shows a read-status-off badge when the preference is disabled', async () => {
		seedTeams( true );
		seedSeenPostsPreference( false );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status off' ) ).toBeVisible();
	} );

	test( 'defaults to on when the preference is unset', async () => {
		seedTeams( true );
		seedSeenPostsPreference();

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status on' ) ).toBeVisible();
	} );
} );
