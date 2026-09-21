/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencySites from '../index';
import type { AgencySite } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const mockSites = [
	{ blog_id: 1, a4a_site_id: 1, url: 'first.example.com', blogname: 'First' },
	{ blog_id: 2, a4a_site_id: 2, url: 'second.example.com', blogname: 'Second' },
] as AgencySite[];

function mockEndpoints() {
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: 'approved' } ] );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: mockSites, total: mockSites.length, perPage: 50, totalPages: 1 } );

	// Only requested once the Add new site modal opens.
	nock( BASE ).persist().get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` ).reply( 200, [] );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/jetpack-licensing/dev-licenses' )
		.query( true )
		.reply( 200, { licenses: [], available: 5 } );

	// Seed the address the site configuration modal opens with.
	nock( BASE )
		.persist()
		.get( '/wpcom/v2/site-suggestions' )
		.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
}

const addNewSiteButton = () => screen.findByRole( 'button', { name: 'Add new site' } );

describe( '<AgencySites>', () => {
	beforeEach( mockEndpoints );

	afterEach( () => nock.cleanAll() );

	test( 'offers a way to add a new site', async () => {
		render( <AgencySites /> );

		expect( await addNewSiteButton() ).toBeVisible();
	} );

	test( 'opens the add-new-site menu in a dialog', async () => {
		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );

		const dialog = await screen.findByRole( 'dialog', { name: 'Add new site' } );
		expect( await screen.findByRole( 'button', { name: /Via the Jetpack plugin/ } ) ).toBeVisible();
		expect( dialog ).toBeVisible();
	} );

	test( 'reports opening the add-new-site menu', async () => {
		const { recordTracksEvent } = render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_agency_sites_add_new_site_clicked'
		);
	} );

	test( 'reports the entry chosen inside the menu', async () => {
		const { recordTracksEvent } = render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );
		await userEvent.click(
			await screen.findByRole( 'button', { name: /Via the Jetpack plugin/ } )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_agency_sites_new_site_action_click_item',
			{ action: 'jetpack-connection' }
		);
	} );

	test( 'opens the development site configuration from the menu', async () => {
		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Create a site now' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Configure your new site' } )
		).toBeVisible();
		expect( await screen.findByLabelText( 'Site address' ) ).toBeVisible();
	} );

	test( 'closes the menu once an entry is chosen', async () => {
		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );
		await userEvent.click(
			await screen.findByRole( 'button', { name: /Via the Jetpack plugin/ } )
		);

		expect( screen.queryByRole( 'dialog', { name: 'Add new site' } ) ).not.toBeInTheDocument();
	} );
} );
