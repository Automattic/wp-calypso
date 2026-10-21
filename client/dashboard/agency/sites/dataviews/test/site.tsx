/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { getSiteNameField } from '../site';
import type { AgencySite } from '@automattic/api-core';
import type { NormalizedField } from '@wordpress/dataviews';

function renderName( item: AgencySite ) {
	const field = getSiteNameField();
	const Cell = field.render;
	if ( ! Cell ) {
		throw new Error( 'name has no render' );
	}
	return render( <Cell item={ item } field={ field as NormalizedField< AgencySite > } /> );
}

const jetpackSite = { blog_id: 1, url: 'example.com', blogname: 'Example' } as AgencySite;

describe( 'getSiteNameField', () => {
	// The test stub never reports the cell in view, so drop it and let the
	// hook's fallback treat the cell as visible.
	const intersectionObserver = window.IntersectionObserver;
	beforeAll( () => {
		delete ( window as { IntersectionObserver?: unknown } ).IntersectionObserver;
	} );
	afterAll( () => {
		window.IntersectionObserver = intersectionObserver;
	} );
	afterEach( () => nock.cleanAll() );

	test( 'flags a Jetpack site WordPress.com cannot reach as unreachable', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1' )
			.query( ( query ) => query.force !== 'wpcom' )
			.reply( 403, {
				error: 'inaccessible_jetpack_site',
				message: 'The Jetpack site is inaccessible or returned an error: transport error',
			} )
			.get( '/rest/v1.1/sites/1' )
			.query( ( query ) => query.force === 'wpcom' )
			.reply( 200, { ID: 1, slug: 'example.com', jetpack: true } );

		const { container } = renderName( jetpackSite );

		await waitFor( () => expect( container ).toHaveTextContent( 'Unreachable' ) );
		expect( container ).toHaveTextContent( 'Example' );
	} );

	test( 'shows no badge for a Jetpack site WordPress.com can reach', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1' )
			.query( true )
			.reply( 200, { ID: 1, jetpack: true } );

		const { container } = renderName( jetpackSite );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( container ).toHaveTextContent( 'Example' );
		expect( container ).not.toHaveTextContent( 'Unreachable' );
	} );
} );
