/** @jest-environment jsdom */
import { rawUserPreferencesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { SubscriberNotificationCard } from '../index';

const key = 'notifications-subscriber-alerts-enabled';

function setup( value?: boolean ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } },
	} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		...( value === undefined ? {} : { [ key ]: value } ),
	} );
	render( <SubscriberNotificationCard />, { queryClient } );
	return userEvent.setup();
}

describe( 'SubscriberNotificationCard', () => {
	it( 'defaults to off when the account has no saved preference', () => {
		setup();
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
	} );

	it( 'reflects the shared account preference', () => {
		setup( true );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
	} );

	it( 'saves the shared boolean only after a successful request', async () => {
		const user = setup( false );
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', { calypso_preferences: { [ key ]: true } } )
			.reply( 200, { calypso_preferences: { [ key ]: true } } );
		await user.click( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) );
		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
			expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
		} );
	} );

	it( 'stays off and disabled while loading and when the preference request fails', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 500, { error: 'server_error' } );
		render( <SubscriberNotificationCard />, { queryClient } );
		const toggle = screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } );
		expect( toggle ).not.toBeChecked();
		expect( toggle ).toBeDisabled();
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( toggle ).not.toBeChecked();
		expect( toggle ).toBeDisabled();
	} );

	it( 'keeps the cached preference checked during a background refetch', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		queryClient.setQueryData( rawUserPreferencesQuery().queryKey, { [ key ]: true } );
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.delay( 50 )
			.reply( 200, { calypso_preferences: { [ key ]: true } } );
		render( <SubscriberNotificationCard />, { queryClient } );
		const toggle = screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } );
		await waitFor( () => expect( toggle ).toBeDisabled() );
		expect( toggle ).toBeChecked();
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( toggle ).toBeEnabled() );
		expect( toggle ).toBeChecked();
	} );

	it( 'stays off when saving the preference fails', async () => {
		const user = setup( false );
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 500, { error: 'server_error' } );
		await user.click( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
	} );
} );
