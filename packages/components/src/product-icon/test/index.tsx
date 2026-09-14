/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import ProductIcon from '../index';
import type { SupportedSlugs } from '../config';

describe( 'ProductIcon', () => {
	// The four 3-year WPCOM term slugs and the icon each should resolve to.
	const threeYearSlugs: [ SupportedSlugs, string ][] = [
		[ 'personal-bundle-3y', 'wpcom-personal' ],
		[ 'value_bundle-3y', 'wpcom-premium' ],
		[ 'business-bundle-3y', 'wpcom-business' ],
		[ 'ecommerce-bundle-3y', 'wpcom-ecommerce' ],
	];

	it.each( threeYearSlugs )( 'renders the %s icon as is-%s', ( slug, iconKey ) => {
		const { container } = render( <ProductIcon slug={ slug } /> );
		expect( container.querySelector( `img.product-icon.is-${ iconKey }` ) ).toBeInTheDocument();
	} );

	// Regression guard: every term variant of the four mapped WPCOM families resolves to an icon.
	const familyTerms: SupportedSlugs[] = [
		'personal-bundle',
		'personal-bundle-monthly',
		'personal-bundle-2y',
		'personal-bundle-3y',
		'value_bundle',
		'value_bundle-monthly',
		'value_bundle-2y',
		'value_bundle-3y',
		'business-bundle',
		'business-bundle-monthly',
		'business-bundle-2y',
		'business-bundle-3y',
		'ecommerce-bundle',
		'ecommerce-bundle-monthly',
		'ecommerce-bundle-2y',
		'ecommerce-bundle-3y',
	];

	it.each( familyTerms )( 'renders an icon for %s', ( slug ) => {
		const { container } = render( <ProductIcon slug={ slug } /> );
		expect( container.querySelector( 'img.product-icon' ) ).toBeInTheDocument();
	} );
} );
