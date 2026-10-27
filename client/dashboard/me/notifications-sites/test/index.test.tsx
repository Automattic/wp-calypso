/** @jest-environment jsdom */
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import NotificationsSites from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	return { ...actual, __esModule: true, isEnabled: jest.fn( actual.isEnabled ) };
} );

const mockIsEnabled = jest.mocked( isEnabled );

function setup( enabled: boolean ) {
	mockIsEnabled.mockImplementation(
		( flag ) => flag === 'notifications/subscriber-alerts' && enabled
	);
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	const settings = nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/settings' )
		.reply( 200, { subscription_delivery_email_blocked: false } );
	const sites = nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [] } );
	const preferences = enabled
		? nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/preferences' )
				.reply( 200, { calypso_preferences: { 'notifications-subscriber-alerts-enabled': true } } )
		: undefined;
	render( <NotificationsSites />, { queryClient } );
	return { settings, sites, preferences };
}

describe( 'NotificationsSites subscriber settings', () => {
	it( 'hides subscriber settings when the feature is disabled', async () => {
		const { settings, sites } = setup( false );
		await waitFor( () => {
			expect( settings.isDone() ).toBe( true );
			expect( sites.isDone() ).toBe( true );
		} );
		expect(
			screen.queryByRole( 'checkbox', { name: 'Subscriber alerts' } )
		).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeVisible();
	} );

	it( 'shows the saved subscriber preference alongside browser notifications when enabled', async () => {
		const { preferences } = setup( true );
		await waitFor( () =>
			expect( screen.getByRole( 'checkbox', { name: 'Subscriber alerts' } ) ).toBeChecked()
		);
		expect( preferences?.isDone() ).toBe( true );
		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeVisible();
	} );
} );
