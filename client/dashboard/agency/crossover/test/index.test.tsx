/**
 * @jest-environment jsdom
 */
import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import CrossoverModalHost from '../';
import { render } from '../../../test-utils';
import { leaveDashboard } from '../store';

const API = 'https://public-api.wordpress.com';
const PREFERENCE = 'a4a-crossover-dismissed';
const PLUGINS_URL = 'https://my.wordpress.com/plugins';

function mockDismissed( dismissed: string[] = [] ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: { [ PREFERENCE ]: dismissed } } );
}

function renderHost() {
	render(
		<>
			<button onClick={ () => leaveDashboard( 'wpcom-plugins', PLUGINS_URL ) }>Plugins</button>
			<CrossoverModalHost />
		</>,
		{ queryClient }
	);
}

describe( '<CrossoverModalHost>', () => {
	let open: jest.SpyInstance;

	beforeEach( () => {
		open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		open.mockRestore();
		queryClient.clear();
	} );

	test( 'opens the destination after the modal and remembers “Don’t show this again”', async () => {
		mockDismissed();
		const saved = new Promise< void >( ( resolve ) => {
			nock( API )
				.post( '/rest/v1.1/me/preferences', ( body ) => {
					if ( body.calypso_preferences?.[ PREFERENCE ]?.includes( 'wpcom-plugins' ) ) {
						resolve();
						return true;
					}
					return false;
				} )
				.query( true )
				.reply( 200, { calypso_preferences: { [ PREFERENCE ]: [ 'wpcom-plugins' ] } } );
		} );
		renderHost();

		await userEvent.click( screen.getByRole( 'button', { name: 'Plugins' } ) );
		expect( open ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Don’t show this again' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue to WordPress.com/ } ) );

		expect( open ).toHaveBeenCalledWith( PLUGINS_URL, '_blank', 'noopener,noreferrer' );
		await saved;
	} );

	test( 'opens a dismissed destination without the modal', async () => {
		mockDismissed( [ 'wpcom-plugins' ] );
		renderHost();
		await waitFor( () =>
			expect( queryClient.getQueryData( rawUserPreferencesQuery().queryKey ) ).toBeDefined()
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Plugins' } ) );

		expect( open ).toHaveBeenCalledWith( PLUGINS_URL, '_blank', 'noopener,noreferrer' );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
