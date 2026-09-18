/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { toAgencyField } from '../hydrate';
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

function renderCell() {
	const field = toAgencyField( hostField );
	const Cell = field.render;
	if ( ! Cell ) {
		throw new Error( 'toAgencyField returned a field without a render' );
	}
	return render( <Cell item={ row } field={ field as NormalizedField< AgencySite > } /> );
}

describe( 'toAgencyField', () => {
	test( 'renders the WordPress.com column once the site loads', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1' )
			.query( true )
			.reply( 200, site );

		const { container } = renderCell();

		await waitFor( () => expect( container ).toHaveTextContent( 'automattic' ) );
	} );

	test( 'renders a placeholder while the site is still loading', async () => {
		let respond: ( value: [ number, Site ] ) => void = () => {};
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1' )
			.query( true )
			.reply( () => new Promise( ( resolve ) => ( respond = resolve ) ) );

		const { container } = renderCell();

		await waitFor( () =>
			expect( container.querySelector( '[aria-hidden="true"]' ) ).toBeVisible()
		);
		expect( container ).not.toHaveTextContent( 'automattic' );

		respond( [ 200, site ] );
		await waitFor( () => expect( container ).toHaveTextContent( 'automattic' ) );
	} );

	test( 'renders as unavailable once the site is known to be unreachable', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1' )
			.query( true )
			.reply( 404, { error: 'unknown_blog', message: 'Unknown blog' } );

		const { container } = renderCell();

		await waitFor( () => expect( container ).toHaveTextContent( '-' ) );
		expect( container.querySelector( '[aria-hidden="true"]' ) ).toBeNull();
	} );
} );
