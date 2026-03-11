/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { InaccessibleJetpackNotice } from '../notices';

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
} );
