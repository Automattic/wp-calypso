/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { SiteHealth } from '../site-health';
import type { Site } from '@automattic/api-core';

const site = { ID: 1, slug: 'example.com', jetpack: true } as Site;

describe( '<SiteHealth>', () => {
	// The test stub never reports the cell in view, so drop it and let the
	// hook's fallback treat the cell as visible.
	const intersectionObserver = window.IntersectionObserver;
	beforeAll( () => {
		delete ( window as { IntersectionObserver?: unknown } ).IntersectionObserver;
	} );
	afterAll( () => {
		window.IntersectionObserver = intersectionObserver;
	} );

	test( 'shows the issues the endpoint reports for a Jetpack site', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/1/dashboard/site-health' )
			.query( true )
			.reply( 200, {
				site_down: true,
				site_disconnected: false,
				backup_failed: true,
				backup_warning: false,
				threats_found: null,
				plugin_updates: 3,
			} );

		render( <SiteHealth site={ site } /> );

		expect( await screen.findByText( 'Site down' ) ).toBeVisible();
		expect( screen.getByText( 'Backup failed' ) ).toBeVisible();
		expect( screen.getByText( '3 plugin updates' ) ).toBeVisible();
	} );

	test( 'shows the issues of a site connected without the Jetpack plugin', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/1/dashboard/site-health' )
			.query( true )
			.reply( 200, {
				site_down: false,
				site_disconnected: false,
				backup_failed: false,
				backup_warning: false,
				threats_found: 0,
				plugin_updates: 1,
			} );

		render( <SiteHealth site={ { ...site, jetpack: false, jetpack_connection: true } } /> );

		expect( await screen.findByText( '1 plugin update' ) ).toBeVisible();
	} );

	test( 'does not ask for the health of a site without a Jetpack connection', async () => {
		const health = nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/1/dashboard/site-health' )
			.query( true )
			.reply( 200, {} );

		render( <SiteHealth site={ { ...site, jetpack: false, jetpack_connection: false } } /> );

		await waitFor( () => expect( screen.getByText( '-' ) ).toBeVisible() );
		expect( health.isDone() ).toBe( false );
	} );
} );
