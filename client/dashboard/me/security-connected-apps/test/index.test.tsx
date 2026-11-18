/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityConnectedApps from '../index';

const API_BASE = 'https://public-api.wordpress.com';

function mockConnectedApplications( connectedApplications: object[] ) {
	nock( API_BASE )
		.get( '/rest/v1.1/me/connected-applications' )
		.query( true )
		.reply( 200, { connected_applications: connectedApplications } );
}

describe( '<SecurityConnectedApps>', () => {
	test( 'shows an empty state instead of the table when no app is connected', async () => {
		mockConnectedApplications( [] );

		render( <SecurityConnectedApps /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No connected applications' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Applications you connect to your account will appear here.' )
		).toBeVisible();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
	} );

	test( 'lists the connected apps', async () => {
		mockConnectedApplications( [
			{ ID: '1', title: 'Example App', icon: 'https://example.com/icon.png' },
		] );

		render( <SecurityConnectedApps /> );

		expect( await screen.findByText( 'Example App' ) ).toBeVisible();
		expect( screen.getByRole( 'table' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No connected applications' } )
		).not.toBeInTheDocument();
	} );
} );
