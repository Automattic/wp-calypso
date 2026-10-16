/**
 * @jest-environment jsdom
 */

import {
	isAutomatticianQuery,
	queryClient,
	siteAbilitiesQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import RemoteAbilitiesSection from '../remote-abilities-section';
import type { Site, SiteAbility, UserSettings } from '@automattic/api-core';

const JETPACK_SITE = {
	ID: 789,
	slug: 'remote-jetpack.example.com',
	name: 'Remote Jetpack',
	jetpack: true,
} as unknown as Site;

const SIMPLE_SITE = {
	...JETPACK_SITE,
	jetpack: false,
} as Site;

const catalog: SiteAbility[] = [
	{
		name: 'jetpack-forms/get-form',
		label: 'Get form',
		description: 'Read a single form.',
		meta: { annotations: { readonly: true } },
	},
	{
		name: 'jetpack-forms/update-form',
		label: 'Update form',
		description: 'Change a form’s fields.',
		meta: { annotations: {} },
	},
	{
		name: 'jetpack-forms/delete-form',
		label: 'Delete form',
		description: 'Delete a form and its responses.',
		meta: { annotations: { destructive: true } },
	},
	{
		name: 'akismet/check-comment',
		label: 'Check comment',
		description: 'Check a comment for spam.',
		meta: { annotations: {} },
	},
];

function seed( {
	activeSite = JETPACK_SITE,
	remoteGroups = {},
	abilities,
}: {
	activeSite?: Site;
	remoteGroups?: Record< string, boolean >;
	abilities?: SiteAbility[];
} ) {
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			sites: [
				{
					blog_id: activeSite.ID,
					site_level_enabled: true,
					...( Object.keys( remoteGroups ).length ? { remote_groups: remoteGroups } : {} ),
				},
			],
		},
	} as unknown as UserSettings );
	queryClient.setQueryData( isAutomatticianQuery().queryKey, { number: 0, teams: [] } );
	if ( abilities ) {
		// The default test user's language is 'en', which maps to wpLocale 'en_US'.
		queryClient.setQueryData( siteAbilitiesQuery( activeSite.ID, 'en_US' ).queryKey, abilities );
	}
}

function mockCatalogFailure( activeSite: Site ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/jetpack-blogs/${ activeSite.ID }/rest-api/` )
		.query( true )
		.reply( 404, {
			code: 'rest_no_route',
			message: 'No route was found matching the URL and request method.',
		} );
}

function mockRemoteGroupsSave( activeSite: Site, expectedGroups: Record< string, boolean > ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/settings', ( body ) => {
			expect( body.mcp_abilities.sites ).toHaveLength( 1 );
			expect( body.mcp_abilities.sites[ 0 ].blog_id ).toBe( activeSite.ID );
			expect( body.mcp_abilities.sites[ 0 ].remote_groups ).toEqual( expectedGroups );
			return true;
		} )
		.reply( 200, {
			mcp_abilities: {
				sites: [
					{
						blog_id: activeSite.ID,
						site_level_enabled: true,
						remote_groups: expectedGroups,
					},
				],
			},
		} );
}

function getPluginCard( plugin: string ): HTMLElement {
	const heading = screen.getByRole( 'heading', { name: plugin } );
	const card = heading.closest( 'div[id]' );
	if ( ! card ) {
		throw new Error( `No card found for ${ plugin }` );
	}
	return card as HTMLElement;
}

function getPluginIntent( plugin: string ) {
	return within( getPluginCard( plugin ) ).getByRole( 'checkbox', { name: 'Enable all' } );
}

function getPluginExpander( plugin: string ) {
	return within( getPluginCard( plugin ) ).getByRole( 'button', { name: 'Show operations' } );
}

beforeEach( () => {
	window.location.hash = '';
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: {
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
		},
		mutations: {
			retry: false,
		},
	} );
} );

describe( '<RemoteAbilitiesSection>', () => {
	test( 'plugin cards are collapsed by default and expand to show ability toggles', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog, remoteGroups: { 'read:jetpack-forms': true } } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="read" />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Site-published abilities' } ) ).toBeVisible();
		expect( getPluginIntent( 'Jetpack Forms' ) ).toBeChecked();
		expect( screen.queryByRole( 'checkbox', { name: 'Get form' } ) ).not.toBeInTheDocument();

		await user.click( getPluginExpander( 'Jetpack Forms' ) );

		expect( screen.getByRole( 'checkbox', { name: 'Get form' } ) ).toBeChecked();
		expect( screen.getByText( 'Read a single form.' ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: 'Update form' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Akismet' } ) ).not.toBeInTheDocument();
	} );

	test( 'write page lists write and destructive abilities with no destructive labeling', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog, remoteGroups: { 'write:akismet': true } } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( getPluginIntent( 'Akismet' ) ).toBeChecked();
		expect( getPluginIntent( 'Jetpack Forms' ) ).not.toBeChecked();

		await user.click( getPluginExpander( 'Jetpack Forms' ) );
		expect( screen.getByRole( 'checkbox', { name: 'Update form' } ) ).toBeVisible();
		expect( screen.getByText( 'Change a form’s fields.' ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'Delete form' } ) ).toBeVisible();
		expect( screen.getByText( 'Delete a form and its responses.' ) ).toBeVisible();

		await user.click( getPluginExpander( 'Akismet' ) );
		expect( screen.getByRole( 'checkbox', { name: 'Check comment' } ) ).toBeChecked();

		expect( screen.queryByRole( 'checkbox', { name: 'Get form' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Destructive' ) ).not.toBeInTheDocument();
	} );

	test( 'an ability toggle saves only its own group key', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		const saveScope = mockRemoteGroupsSave( JETPACK_SITE, {
			'write:jetpack-forms': true,
		} );
		await user.click( getPluginExpander( 'Jetpack Forms' ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Update form' } ) );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
	} );

	test( 'a destructive ability toggle saves the destructive group key with no labeling', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		const saveScope = mockRemoteGroupsSave( JETPACK_SITE, {
			'destructive:jetpack-forms': true,
		} );
		await user.click( getPluginExpander( 'Jetpack Forms' ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Delete form' } ) );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
		expect( screen.queryByText( 'Destructive' ) ).not.toBeInTheDocument();
	} );

	test( 'a plugin intent saves every group key the plugin has on the page', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		const saveScope = mockRemoteGroupsSave( JETPACK_SITE, {
			'write:jetpack-forms': true,
			'destructive:jetpack-forms': true,
		} );
		await user.click( getPluginIntent( 'Jetpack Forms' ) );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( getPluginIntent( 'Jetpack Forms' ) ).toBeChecked();
		} );
	} );

	test( 'a plugin anchor hash opens that card on load', () => {
		window.location.hash = '#jetpack-forms';
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( screen.getByRole( 'checkbox', { name: 'Update form' } ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: 'Check comment' } ) ).not.toBeInTheDocument();
	} );

	test( 'an ability anchor hash opens the card containing it on load', () => {
		window.location.hash = '#jetpack-forms/update-form';
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( screen.getByRole( 'checkbox', { name: 'Update form' } ) ).toBeVisible();
		expect( document.getElementById( 'jetpack-forms/update-form' ) ).not.toBeNull();
		expect( screen.queryByRole( 'checkbox', { name: 'Check comment' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows saved groups with a notice when the catalog cannot be loaded', async () => {
		seed( { remoteGroups: { 'write:akismet': true } } );
		const failureScope = mockCatalogFailure( JETPACK_SITE );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( await screen.findByText( /can’t be loaded right now/ ) ).toBeVisible();
		expect( getPluginIntent( 'Akismet' ) ).toBeChecked();
		// Nothing published locally, so there is nothing to expand.
		expect(
			within( getPluginCard( 'Akismet' ) ).queryByRole( 'button', { name: 'Show operations' } )
		).not.toBeInTheDocument();

		await waitFor( () => {
			expect( failureScope.isDone() ).toBe( true );
		} );
	} );

	test( 'hides when the site publishes nothing and nothing is saved', () => {
		seed( { abilities: [] } );
		render( <RemoteAbilitiesSection site={ JETPACK_SITE } category="read" />, { queryClient } );

		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );

	test( 'hides on Simple sites', () => {
		seed( { activeSite: SIMPLE_SITE, abilities: catalog } );
		render( <RemoteAbilitiesSection site={ SIMPLE_SITE } category="read" />, { queryClient } );

		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );
} );
