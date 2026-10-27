/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySiteHeaderActions from '../header-actions';
import type { AgencySite, Site } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const site = {
	blog_id: 123,
	a4a_site_id: 42,
	url: 'example.com',
	url_with_scheme: 'https://example.com',
} as AgencySite;

const pressableSite = { ...site, hosting_provider_guess: 'pressable' } as AgencySite;

const fullSite = { options: { admin_url: 'https://example.com/custom-admin/' } } as Site;

function mockAgency( { role = 'a4a_administrator', capabilities = [] as string[] } = {} ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 7, user: { role, capabilities } } ] );
}

async function openMenu() {
	await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	await userEvent.click( screen.getByRole( 'button', { name: 'Quick actions' } ) );
	// The popover positions itself before its items become visible.
	await waitFor( () =>
		expect( screen.getByRole( 'menuitem', { name: 'View activity' } ) ).toBeVisible()
	);
}

describe( '<AgencySiteHeaderActions>', () => {
	test( 'links to the site’s own wp-admin', async () => {
		mockAgency();

		render( <AgencySiteHeaderActions site={ site } fullSite={ fullSite } /> );

		expect( await screen.findByRole( 'link', { name: 'WP Admin' } ) ).toHaveAttribute(
			'href',
			'https://example.com/custom-admin/'
		);
	} );

	test( 'falls back to the default wp-admin when the site reports none', async () => {
		mockAgency();

		render( <AgencySiteHeaderActions site={ site } fullSite={ {} as Site } /> );

		expect( await screen.findByRole( 'link', { name: 'WP Admin' } ) ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/'
		);
	} );

	test( 'opens Settings under an admin URL without a trailing slash', async () => {
		mockAgency();
		const open = jest.spyOn( window, 'open' ).mockReturnValue( null );

		render(
			<AgencySiteHeaderActions
				site={ site }
				fullSite={ { options: { admin_url: 'https://example.com/custom-admin' } } as Site }
			/>
		);
		await openMenu();
		await userEvent.click( screen.getByRole( 'menuitem', { name: /Settings/ } ) );

		expect( open ).toHaveBeenCalledWith(
			'https://example.com/custom-admin/options-general.php',
			'_blank',
			'noreferrer,noopener'
		);
		open.mockRestore();
	} );

	test( 'keeps WP Admin but hides the menu on a disconnected site', async () => {
		mockAgency();

		render(
			<AgencySiteHeaderActions
				site={ { ...site, is_connection_healthy: false } }
				fullSite={ fullSite }
			/>
		);

		expect( await screen.findByRole( 'link', { name: 'WP Admin' } ) ).toBeVisible();
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'button', { name: 'Quick actions' } ) ).not.toBeInTheDocument();
	} );

	test( 'offers Manage in Pressable to the agency owner on a Pressable site', async () => {
		mockAgency( { role: 'a4a_administrator' } );

		render( <AgencySiteHeaderActions site={ pressableSite } fullSite={ fullSite } /> );
		await openMenu();

		expect( screen.getByRole( 'menuitem', { name: /Manage in Pressable/ } ) ).toBeVisible();
	} );

	test( 'does not offer Manage in Pressable to a team member', async () => {
		mockAgency( { role: 'a4a_manager' } );

		render( <AgencySiteHeaderActions site={ pressableSite } fullSite={ fullSite } /> );
		await openMenu();

		expect(
			screen.queryByRole( 'menuitem', { name: /Manage in Pressable/ } )
		).not.toBeInTheDocument();
	} );

	test( 'offers Remove site with the capability to remove sites', async () => {
		mockAgency( { capabilities: [ 'a4a_remove_managed_sites' ] } );

		render( <AgencySiteHeaderActions site={ site } fullSite={ fullSite } /> );
		await openMenu();

		expect( screen.getByRole( 'menuitem', { name: 'Remove site' } ) ).toBeVisible();
	} );

	test( 'does not offer Remove site without the capability to remove sites', async () => {
		mockAgency( { capabilities: [] } );

		render( <AgencySiteHeaderActions site={ site } fullSite={ fullSite } /> );
		await openMenu();

		expect( screen.queryByRole( 'menuitem', { name: 'Remove site' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not offer Remove site on a dev site', async () => {
		mockAgency( { capabilities: [ 'a4a_remove_managed_sites' ] } );

		render(
			<AgencySiteHeaderActions site={ { ...site, a4a_is_dev_site: true } } fullSite={ fullSite } />
		);
		await openMenu();

		expect( screen.queryByRole( 'menuitem', { name: 'Remove site' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not offer Remove site on a site still being set up', async () => {
		mockAgency( { capabilities: [ 'a4a_remove_managed_sites' ] } );

		render(
			<AgencySiteHeaderActions
				site={ { ...site, a4a_site_id: undefined } as unknown as AgencySite }
				fullSite={ fullSite }
			/>
		);
		await openMenu();

		expect( screen.queryByRole( 'menuitem', { name: 'Remove site' } ) ).not.toBeInTheDocument();
	} );
} );
