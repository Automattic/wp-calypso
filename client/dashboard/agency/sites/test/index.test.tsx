/**
 * @jest-environment jsdom
 */

import { agencyPendingSitesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencySites from '../index';
import type { AgencySite } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const mockSites = [
	{ blog_id: 1, a4a_site_id: 1, url: 'first.example.com', blogname: 'First' },
	{
		blog_id: 2,
		a4a_site_id: 2,
		url: 'second.example.com',
		blogname: 'Second',
		a4a_is_dev_site: true,
	},
] as AgencySite[];

function pendingSite( id: number, state: string, licenseKey = 'wpcom-hosting-business_abc' ) {
	return { id, features: { wpcom_atomic: { license_key: licenseKey, state } } };
}

function mockEndpoints( pendingSites: unknown[] = [] ) {
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

	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` )
		.reply( 200, pendingSites );

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
	test( 'offers a way to add a new site', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		expect( await addNewSiteButton() ).toBeVisible();
	} );

	test( 'opens the add-new-site menu in a dialog', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );

		const dialog = await screen.findByRole( 'dialog', { name: 'Add new site' } );
		expect( await screen.findByRole( 'button', { name: /Via the Jetpack plugin/ } ) ).toBeVisible();
		expect( dialog ).toBeVisible();
	} );

	test( 'reports opening the add-new-site menu', async () => {
		mockEndpoints();

		const { recordTracksEvent } = render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_agency_sites_add_new_site_clicked'
		);
	} );

	test( 'reports the entry chosen inside the menu', async () => {
		mockEndpoints();

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

	test( 'marks a development site in the list', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		const devRow = await screen.findByRole( 'row', { name: /Second/ } );
		expect( within( devRow ).getByText( 'Development' ) ).toBeVisible();
		expect(
			within( screen.getByRole( 'row', { name: /First/ } ) ).queryByText( 'Development' )
		).not.toBeInTheDocument();
	} );

	test( 'opens the development site configuration from the menu', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Create a site now' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Configure your new site' } )
		).toBeVisible();
		expect( await screen.findByLabelText( 'Site address' ) ).toBeVisible();
	} );

	test( 'closes the menu once an entry is chosen', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		await userEvent.click( await addNewSiteButton() );
		await userEvent.click(
			await screen.findByRole( 'button', { name: /Via the Jetpack plugin/ } )
		);

		expect( screen.queryByRole( 'dialog', { name: 'Add new site' } ) ).not.toBeInTheDocument();
	} );

	test( 'points licenses waiting to be set up at the unassigned Purchases filter', async () => {
		mockEndpoints( [
			pendingSite( 7, 'pending' ),
			pendingSite( 8, 'pending', 'wpcom-hosting-x_def' ),
		] );

		render( <AgencySites /> );

		expect(
			await screen.findByText( /2 WordPress\.com licenses are ready to set up/ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set them up in Purchases' } ) ).toHaveAttribute(
			'href',
			'/marketplace/purchases?status=unassigned&search=WordPress.com'
		);
	} );

	// The header counts on every /sites load, so it must not take the route down
	// when the endpoint answers with something other than the expected list.
	test( 'survives a response that is not a list of pending sites', async () => {
		mockEndpoints( { error: 'unauthorized' } as unknown as unknown[] );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		render( <AgencySites />, { queryClient } );

		// Assert against the cache rather than the screen: the header renders
		// before the payload lands, so waiting on it would pass either way.
		await waitFor( () =>
			expect( queryClient.getQueryData( agencyPendingSitesQuery( AGENCY_ID ).queryKey ) ).toEqual( {
				error: 'unauthorized',
			} )
		);

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );

	test( 'says nothing when every license already has its site', async () => {
		mockEndpoints( [ pendingSite( 7, 'provisioning' ) ] );

		render( <AgencySites /> );

		await screen.findByRole( 'heading', { name: 'Sites' } );
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );
} );
