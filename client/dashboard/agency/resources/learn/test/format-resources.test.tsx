/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { formatAgencyResource } from '../format-resources';
import type { AgencyResource } from '@automattic/api-core';

function resource( overrides: Partial< AgencyResource > = {} ): AgencyResource {
	return {
		id: 1,
		name: 'WordPress Certifications',
		description: '',
		external_url: 'https://wordpresscertifications.com/',
		format: 'link',
		related_product: 'WordPress',
		related_product_type: 'WordPress',
		resource_type: 'Course',
		preview_image: '',
		section: 'featured',
		created_at: '',
		updated_at: '',
		...overrides,
	} as AgencyResource;
}

describe( 'formatAgencyResource', () => {
	test( 'related product "WordPress" gets the WordPress logo', () => {
		const { logo } = formatAgencyResource( resource() );

		render( <>{ logo }</> );

		expect( screen.getByRole( 'img', { name: 'WordPress' } ) ).toBeVisible();
	} );
} );
