/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { getHostField, getPhpVersionField } from '../endpoint-fields';
import type { AgencySite } from '@automattic/api-core';
import type { Field, NormalizedField } from '@wordpress/dataviews';

function renderField( field: Field< AgencySite >, item: AgencySite ) {
	const Cell = field.render;
	if ( ! Cell ) {
		throw new Error( `${ field.id } has no render` );
	}
	return render( <Cell item={ item } field={ field as NormalizedField< AgencySite > } /> );
}

const jetpackSite = { blog_id: 1, url: 'example.com' } as AgencySite;

describe( 'getHostField', () => {
	test( 'names the provider when the endpoint guessed one', async () => {
		const { container } = renderField( getHostField(), {
			...jetpackSite,
			hosting_provider_guess: 'pressable',
		} );
		await waitFor( () => expect( container ).toHaveTextContent( 'Pressable' ) );
	} );

	test( 'falls back to WordPress.com only for Atomic and Simple sites', async () => {
		const { container } = renderField( getHostField(), { ...jetpackSite, is_atomic: true } );
		await waitFor( () => expect( container ).toHaveTextContent( 'WordPress.com' ) );
	} );

	test( 'does not claim a self-hosted site is on WordPress.com', async () => {
		const { container } = renderField( getHostField(), jetpackSite );
		await waitFor( () => expect( container ).toHaveTextContent( '-' ) );
		expect( container ).not.toHaveTextContent( 'WordPress.com' );
	} );
} );

describe( 'getPhpVersionField', () => {
	test( 'shows the version the endpoint reported, with no plan gate', async () => {
		const { container } = renderField( getPhpVersionField(), {
			...jetpackSite,
			php_version: '8.3',
		} );
		await waitFor( () => expect( container ).toHaveTextContent( '8.3' ) );
	} );
} );
