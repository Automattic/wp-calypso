/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencySites from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function pendingSite( id: number, state: string, licenseKey = 'wpcom-hosting-business_abc' ) {
	return { id, features: { wpcom_atomic: { license_key: licenseKey, state } } };
}

function mockPage( pendingSites: unknown[] ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [], total: 0 } )
		.persist();
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` )
		.reply( 200, pendingSites )
		.persist();
}

describe( '<AgencySites>', () => {
	test( 'points licenses waiting to be set up at the unassigned Purchases filter', async () => {
		mockPage( [ pendingSite( 7, 'pending' ), pendingSite( 8, 'pending', 'wpcom-hosting-x_def' ) ] );

		render( <AgencySites /> );

		expect(
			await screen.findByText( /2 WordPress\.com licenses are ready to set up/ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set them up in Purchases' } ) ).toHaveAttribute(
			'href',
			'/marketplace/purchases?status=unassigned&search=WordPress.com'
		);
	} );

	test( 'says nothing when every license already has its site', async () => {
		mockPage( [ pendingSite( 7, 'provisioning' ) ] );

		render( <AgencySites /> );

		await screen.findByRole( 'heading', { name: 'Sites' } );
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );
} );
