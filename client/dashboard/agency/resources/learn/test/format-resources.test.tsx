/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { formatAgencyResource } from '../format-resources';
import type { AgencyResource } from '@automattic/api-core';

function buildResource( overrides: Partial< AgencyResource > = {} ): AgencyResource {
	return {
		id: '1',
		name: 'A resource',
		description: '',
		external_url: '',
		format: 'Link',
		related_product: '',
		related_product_type: '',
		resource_type: 'Blog post',
		preview_image: '',
		section: '',
		created_at: '2026-03-12',
		updated_at: '2026-07-20',
		...overrides,
	} as AgencyResource;
}

function logoAltFor( overrides: Partial< AgencyResource > ): string | null {
	const { logo } = formatAgencyResource( buildResource( overrides ) );

	if ( ! logo ) {
		return null;
	}

	render( <>{ logo }</> );
	return screen.getByRole( 'img' ).getAttribute( 'alt' );
}

describe( 'getProductLogo publisher fallback', () => {
	test( 'uses the AgencyHabits logo when the destination host is agencyhabits.com', () => {
		expect(
			logoAltFor( {
				external_url:
					'https://www.agencyhabits.com/the-10-habits-that-separate-thriving-agencies-from-struggling-ones?utm_source=a4a-resource-center',
			} )
		).toBe( 'AgencyHabits' );
	} );

	test( 'keeps the related_product mapping when the API attributes the resource', () => {
		expect(
			logoAltFor( { related_product: 'Pressable', external_url: 'https://pressable.com/blog' } )
		).toBe( 'Pressable' );
	} );

	test( 'ignores a publisher name that only appears in campaign parameters', () => {
		expect(
			logoAltFor( {
				external_url: 'https://example.com/post?utm_campaign=2026Q2-agencyhabits',
			} )
		).toBeNull();
	} );

	test( 'renders no logo for an unattributed resource on an unknown host', () => {
		expect( logoAltFor( { external_url: 'https://example.com/post' } ) ).toBeNull();
	} );

	test( 'does not throw on an empty or malformed external_url', () => {
		expect( logoAltFor( { external_url: '' } ) ).toBeNull();
		expect( logoAltFor( { external_url: 'not a url' } ) ).toBeNull();
	} );
} );
