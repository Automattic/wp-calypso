/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { InaccessibleJetpackNotice } from '../notices';
import type { Site } from '@automattic/api-core';

describe( '<InaccessibleJetpackNotice>', () => {
	test( 'displays the error message', () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

		const error = new Error( 'Connection timed out' );
		render( <InaccessibleJetpackNotice error={ error } /> );

		expect( screen.getByText( 'Connection timed out' ) ).toBeVisible();
	} );

	test( 'logs to Logstash on mount', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/logstash', ( body ) => {
				const params = JSON.parse( body.params );
				return (
					params.feature === 'calypso_client' &&
					params.message === 'Connection timed out' &&
					params.tags.includes( 'jetpack-inaccessible' )
				);
			} )
			.reply( 200 );

		const error = new Error( 'Connection timed out' );
		render( <InaccessibleJetpackNotice error={ error } /> );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders the notice title when the error has no message', () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

		render( <InaccessibleJetpackNotice error={ new Error() } /> );

		expect( screen.getByText( 'Your Jetpack site cannot be reached at this time.' ) ).toBeVisible();
	} );

	test( 'opens a remove site confirmation when a site is provided', async () => {
		const user = userEvent.setup();
		const site = {
			ID: 123,
			slug: 'my-jetpack-site.example.com',
			name: 'My Jetpack Site',
			URL: 'https://my-jetpack-site.example.com',
			jetpack: true,
			jetpack_connection: true,
			is_wpcom_atomic: false,
		} as Site;

		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/upgrades' )
			.query( { site: site.ID } )
			.reply( 200, [] );

		render(
			<InaccessibleJetpackNotice error={ new Error( 'Connection failed' ) } site={ site } />
		);

		await user.click( screen.getByRole( 'button', { name: 'Remove site' } ) );

		expect( await screen.findByRole( 'dialog', { name: 'Remove site' } ) ).toBeVisible();
		expect(
			await screen.findByRole( 'textbox', { name: 'Type the site domain to confirm' } )
		).toBeVisible();
	} );
} );
