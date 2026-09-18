/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import PreferencesReader from '..';
import { render } from '../../../test-utils';

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
} );

function seedSeenPostsPreference( enabled?: boolean ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		...( enabled === undefined ? {} : { 'reader-seen-posts': enabled } ),
	} );
}

describe( '<PreferencesReader>', () => {
	test( 'links to the Reader preferences page when seen posts is available', async () => {
		seedSeenPostsPreference( true );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByRole( 'link', { name: /Reader/i } ) ).toHaveAttribute(
			'href',
			'/me/preferences/reader'
		);
	} );

	test( 'shows a read-status-on badge when the preference is enabled', async () => {
		seedSeenPostsPreference( true );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status on' ) ).toBeVisible();
	} );

	test( 'shows a read-status-off badge when the preference is disabled', async () => {
		seedSeenPostsPreference( false );

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status off' ) ).toBeVisible();
	} );

	test( 'defaults to on when the preference is unset', async () => {
		seedSeenPostsPreference();

		render( <PreferencesReader />, { queryClient } );

		expect( await screen.findByText( 'Read status on' ) ).toBeVisible();
	} );
} );
