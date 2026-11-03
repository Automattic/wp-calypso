/** @jest-environment jsdom */
import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { SubscriberNotificationCard } from '../index';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: jest.fn() } ) );

const key = 'notifications-subscriber-alerts-enabled';

function setup( value?: boolean ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		...( value === undefined ? {} : { [ key ]: value } ),
	} );
	const { recordTracksEvent } = render( <SubscriberNotificationCard />, { queryClient } );
	return { user: userEvent.setup(), recordTracksEvent };
}

describe( 'SubscriberNotificationCard', () => {
	beforeEach( () => {
		queryClient.clear();
		jest.mocked( isEnabled ).mockReturnValue( true );
		queryClient.setQueryDefaults( rawUserPreferencesQuery().queryKey, {
			staleTime: Infinity,
			retry: false,
		} );
	} );

	it( 'defaults to on when the account has no saved preference', () => {
		setup();
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
	} );

	it( 'leaves unset preferences off when the default rollout is disabled', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		setup();
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
	} );

	it( 'preserves saved opt-ins when the default rollout is disabled', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		setup( true );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
	} );

	it( 'preserves saved opt-outs when the default rollout is enabled', () => {
		setup( false );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
	} );

	it( 'reflects the shared account preference', () => {
		setup( true );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
	} );

	it( 'saves the shared boolean only after a successful request', async () => {
		const { user, recordTracksEvent } = setup( false );
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', { calypso_preferences: { [ key ]: true } } )
			.reply( 200, { calypso_preferences: { [ key ]: true } } );
		await user.click( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) );
		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
			expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked();
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_notifications_subscriber_alerts_settings_updated',
			{ setting_value: true }
		);
	} );

	it( 'saves and tracks an explicit opt-out from the new default', async () => {
		const { user, recordTracksEvent } = setup();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', { calypso_preferences: { [ key ]: false } } )
			.reply( 200, { calypso_preferences: { [ key ]: false } } );
		await user.click( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) );
		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
			expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_notifications_subscriber_alerts_settings_updated',
			{ setting_value: false }
		);
	} );

	it( 'stays off and disabled while loading and when the preference request fails', async () => {
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
		queryClient.setQueryDefaults( rawUserPreferencesQuery().queryKey, { retry: false } );
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
		const { user, recordTracksEvent } = setup( false );
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 500, { error: 'server_error' } );
		await user.click( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).not.toBeChecked();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
