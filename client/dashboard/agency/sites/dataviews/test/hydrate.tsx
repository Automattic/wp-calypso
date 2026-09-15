/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { toAgencyField } from '../hydrate';
import type { HydratedSite } from '../hydrate';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field, NormalizedField } from '@wordpress/dataviews';

const row = { blog_id: 1, url: 'example.com' } as AgencySite;
const site = { ID: 1, hosting_provider_guess: 'automattic' } as Site;

// Reads `field.getValue` the way the `host` and `visibility` columns do, so the
// test covers the normalized field the adapter has to synthesize.
const hostField: Field< Site > = {
	id: 'host',
	label: 'Host',
	getValue: ( { item } ) => item.hosting_provider_guess,
	render: ( { field, item } ) => <span>{ field.getValue( { item } ) }</span>,
};

function renderCell( hydrated?: HydratedSite ) {
	const field = toAgencyField( hostField, () => hydrated );
	const Cell = field.render;
	if ( ! Cell ) {
		throw new Error( 'toAgencyField returned a field without a render' );
	}
	return render( <Cell item={ row } field={ field as NormalizedField< AgencySite > } /> );
}

describe( 'toAgencyField', () => {
	test( 'renders the WordPress.com column when the row has a site', () => {
		const { container } = renderCell( { site, isPending: false } );
		expect( container ).toHaveTextContent( 'automattic' );
	} );

	test( 'renders a placeholder while the site is still loading', () => {
		const { container } = renderCell( { isPending: true } );
		expect( container ).not.toHaveTextContent( 'automattic' );
		expect( container.querySelector( '[aria-hidden="true"]' ) ).toBeVisible();
	} );

	test( 'renders as unavailable once the site is known to be unreachable', () => {
		const { container } = renderCell( { isPending: false } );
		expect( container ).toHaveTextContent( '-' );
		expect( container.querySelector( '[aria-hidden="true"]' ) ).toBeNull();
	} );

	test( 'exposes the value for the row via getValue', () => {
		const hydrated = { site, isPending: false };
		expect( toAgencyField( hostField, () => hydrated ).getValue?.( { item: row } ) ).toBe(
			'automattic'
		);
		expect( toAgencyField( hostField, () => undefined ).getValue?.( { item: row } ) ).toBe( '' );
	} );
} );
