/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
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
	test( 'names the provider when the endpoint guessed one', () => {
		const { container } = renderField( getHostField(), {
			...jetpackSite,
			hosting_provider_guess: 'pressable',
		} );
		expect( container ).toHaveTextContent( 'Pressable' );
	} );

	test( 'falls back to WordPress.com only for Atomic and Simple sites', () => {
		const { container } = renderField( getHostField(), { ...jetpackSite, is_atomic: true } );
		expect( container ).toHaveTextContent( 'WordPress.com' );
	} );

	test( 'does not claim a self-hosted site is on WordPress.com', () => {
		const { container } = renderField( getHostField(), jetpackSite );
		expect( container ).not.toHaveTextContent( 'WordPress.com' );
		expect( container ).toHaveTextContent( '-' );
	} );
} );

describe( 'getPhpVersionField', () => {
	test( 'shows the version the endpoint reported, with no plan gate', () => {
		const { container } = renderField( getPhpVersionField(), {
			...jetpackSite,
			php_version: '8.3',
		} );
		expect( container ).toHaveTextContent( '8.3' );
	} );
} );
