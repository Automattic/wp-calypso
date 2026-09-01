/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ReaderPreferences from '../index';

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
} );

afterEach( () => {
	nock.cleanAll();
} );

function seedSeenPostsPreference( enabled?: boolean ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		...( enabled === undefined ? {} : { 'reader-seen-posts': enabled } ),
	} );
}

describe( '<ReaderPreferences>', () => {
	test( 'renders the show read status toggle as checked by default', async () => {
		seedSeenPostsPreference();

		render( <ReaderPreferences />, { queryClient } );

		expect( await screen.findByRole( 'checkbox', { name: 'Show read status' } ) ).toBeChecked();
	} );

	test( 'saves false when the toggle is turned off', async () => {
		const user = userEvent.setup();
		seedSeenPostsPreference( true );
		const saveRequest = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect( body.calypso_preferences[ 'reader-seen-posts' ] ).toBe( false );
				return true;
			} )
			.reply( 200, { calypso_preferences: { 'reader-seen-posts': false } } );

		render( <ReaderPreferences />, { queryClient } );

		await user.click( await screen.findByRole( 'checkbox', { name: 'Show read status' } ) );

		await waitFor( () => expect( saveRequest.isDone() ).toBe( true ) );
	} );

	test( 'saves true when the toggle is turned back on', async () => {
		const user = userEvent.setup();
		seedSeenPostsPreference( false );
		const saveRequest = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect( body.calypso_preferences[ 'reader-seen-posts' ] ).toBe( true );
				return true;
			} )
			.reply( 200, { calypso_preferences: { 'reader-seen-posts': true } } );

		render( <ReaderPreferences />, { queryClient } );

		const toggle = await screen.findByRole( 'checkbox', { name: 'Show read status' } );
		expect( toggle ).not.toBeChecked();

		await user.click( toggle );

		await waitFor( () => expect( saveRequest.isDone() ).toBe( true ) );
	} );
} );
