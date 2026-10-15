/** @jest-environment jsdom */
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import Notifications from '../index';

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
	if ( enabled ) {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { 'notifications-subscriber-alerts-enabled': true } } );
	}
	render( <Notifications />, { queryClient } );
	return settings;
}

describe( 'Notifications settings navigation', () => {
	it.each( [ false, true ] )(
		'keeps subscriber settings off the root page with feature enabled=%s',
		async ( enabled ) => {
			const settings = setup( enabled );
			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Notifications' } ) ).toBeVisible()
			);
			expect( settings.isDone() ).toBe( true );
			expect(
				screen.queryByRole( 'checkbox', { name: 'Subscriber alerts' } )
			).not.toBeInTheDocument();
			expect( screen.getByText( 'Sites' ) ).toBeVisible();
			expect( screen.getByText( 'Emails' ) ).toBeVisible();
		}
	);
} );
