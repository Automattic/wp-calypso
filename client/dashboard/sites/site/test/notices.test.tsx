/**
 * @jest-environment jsdom
 */

import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { InaccessibleJetpackNotice } from '../notices';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'broken.wpcomstaging.com',
	jetpack: true,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	plan: {
		features: {
			active: [ DotcomFeatures.ATOMIC, HostingFeatures.SFTP ],
		},
	},
} as Site;

const siteWithoutSftp = {
	...site,
	plan: { features: { active: [ DotcomFeatures.ATOMIC ] } },
} as Site;

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

	test( 'links to the SFTP/SSH settings when the plan includes SFTP', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

		render( <InaccessibleJetpackNotice error={ new Error() } site={ site } /> );

		expect( await screen.findByRole( 'link', { name: 'Connect over SFTP/SSH' } ) ).toHaveAttribute(
			'href',
			'/sites/broken.wpcomstaging.com/settings/sftp-ssh'
		);
	} );

	test( 'links to the SFTP/SSH settings when the plan does not include SFTP', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

		render( <InaccessibleJetpackNotice error={ new Error() } site={ siteWithoutSftp } /> );

		expect( await screen.findByRole( 'link', { name: 'Connect over SFTP/SSH' } ) ).toHaveAttribute(
			'href',
			'/sites/broken.wpcomstaging.com/settings/sftp-ssh'
		);
	} );

	test( 'does not link to the SFTP/SSH settings for users who cannot manage the site', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );

		render(
			<InaccessibleJetpackNotice
				error={ new Error() }
				site={ { ...siteWithoutSftp, capabilities: { manage_options: false } } as Site }
			/>
		);

		expect(
			await screen.findByText( 'Your Jetpack site cannot be reached at this time.' )
		).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Connect over SFTP/SSH' } )
		).not.toBeInTheDocument();
	} );
} );
