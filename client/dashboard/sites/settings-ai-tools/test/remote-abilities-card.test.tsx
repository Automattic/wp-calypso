/**
 * @jest-environment jsdom
 */

import {
	bigSkyPluginQuery,
	isAutomatticianQuery,
	queryClient,
	siteAbilitiesQuery,
	siteBySlugQuery,
	sitePostByEmailSettingsQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AIToolsSettings from '../index';
import type { Site, SiteAbility, UserSettings } from '@automattic/api-core';

const jetpackSite = {
	ID: 789,
	slug: 'remote-jetpack.example.com',
	name: 'Remote Jetpack',
	title: 'Remote Jetpack',
	is_wpcom_atomic: false,
	jetpack: true,
	options: {
		admin_url: 'https://remote-jetpack.example.com/wp-admin/',
	},
} as unknown as Site;

const simpleSite = {
	...jetpackSite,
	ID: 456,
	slug: 'remote-simple.wordpress.com',
	is_wpcom_atomic: false,
	jetpack: false,
} as Site;

const catalog: SiteAbility[] = [
	{
		name: 'jetpack-boost/get-status',
		label: 'Get status',
		meta: { annotations: { readonly: true } },
	},
	{
		name: 'jetpack-boost/set-module',
		label: 'Set module',
		meta: { annotations: {} },
	},
	{
		name: 'jetpack-backup/delete-backup',
		label: 'Delete backup',
		meta: { annotations: { destructive: true } },
	},
];

function seedQueries( {
	activeSite,
	isMcpEnabled = true,
	remoteGroups = {},
	abilities,
}: {
	activeSite: Site;
	isMcpEnabled?: boolean;
	remoteGroups?: Record< string, boolean >;
	abilities?: SiteAbility[];
} ) {
	queryClient.setQueryData( siteBySlugQuery( activeSite.slug ).queryKey, activeSite );
	queryClient.setQueryData( bigSkyPluginQuery( activeSite.ID ).queryKey, {
		blog_id: activeSite.ID,
		enabled: false,
		available: true,
		on_free_trial: false,
	} );
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			sites: isMcpEnabled
				? [
						{
							blog_id: activeSite.ID,
							site_level_enabled: true,
							abilities: {},
							...( Object.keys( remoteGroups ).length ? { remote_groups: remoteGroups } : {} ),
						},
					]
				: [],
		},
	} as UserSettings );
	queryClient.setQueryData( isAutomatticianQuery().queryKey, { number: 0, teams: [] } );
	queryClient.setQueryData( sitePostByEmailSettingsQuery( activeSite ).queryKey, {
		post_by_email_address: '',
	} );
	if ( abilities ) {
		queryClient.setQueryData( siteAbilitiesQuery( activeSite.ID ).queryKey, abilities );
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
						abilities: {},
						remote_groups: expectedGroups,
					},
				],
			},
		} );
}

function getNamespaceGroup( namespace: string ) {
	const heading = screen.getByRole( 'heading', { name: namespace } );
	const group = heading.closest( 'div' );
	if ( ! group ) {
		throw new Error( `No group container found for ${ namespace }` );
	}
	return within( group );
}

beforeEach( () => {
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

describe( '<AIToolsSettings> site-published abilities', () => {
	test( 'shows namespace groups from the catalog and the saved allowlist on a connected site', () => {
		seedQueries( {
			activeSite: jetpackSite,
			remoteGroups: { 'read:jetpack-boost': true, 'destructive:jetpack-backup': true },
			abilities: catalog,
		} );
		render( <AIToolsSettings siteSlug={ jetpackSite.slug } />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Site-published abilities' } ) ).toBeVisible();

		const boost = getNamespaceGroup( 'jetpack-boost' );
		expect( boost.getByRole( 'checkbox', { name: 'Read' } ) ).toBeChecked();
		expect( boost.getByRole( 'checkbox', { name: 'Write' } ) ).not.toBeChecked();
		expect( boost.queryByRole( 'checkbox', { name: 'Destructive' } ) ).not.toBeInTheDocument();

		const backup = getNamespaceGroup( 'jetpack-backup' );
		expect( backup.getByRole( 'checkbox', { name: 'Destructive' } ) ).toBeChecked();
		expect( backup.queryByRole( 'checkbox', { name: 'Read' } ) ).not.toBeInTheDocument();
		expect( backup.queryByRole( 'checkbox', { name: 'Write' } ) ).not.toBeInTheDocument();
	} );

	test( 'saves a partial remote_groups update when a group is toggled', async () => {
		const user = userEvent.setup();
		seedQueries( {
			activeSite: jetpackSite,
			remoteGroups: { 'read:jetpack-boost': true },
			abilities: catalog,
		} );
		render( <AIToolsSettings siteSlug={ jetpackSite.slug } />, { queryClient } );

		const saveScope = mockRemoteGroupsSave( jetpackSite, { 'write:jetpack-boost': true } );
		await user.click(
			getNamespaceGroup( 'jetpack-boost' ).getByRole( 'checkbox', { name: 'Write' } )
		);

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect(
				getNamespaceGroup( 'jetpack-boost' ).getByRole( 'checkbox', { name: 'Write' } )
			).toBeChecked();
		} );
	} );

	test( 'does not show the section on a Simple site', () => {
		seedQueries( { activeSite: simpleSite, abilities: catalog } );
		render( <AIToolsSettings siteSlug={ simpleSite.slug } />, { queryClient } );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable MCP access for this site' } )
		).toBeChecked();
		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );

	test( 'does not show the section when MCP access is disabled for the site', () => {
		seedQueries( { activeSite: jetpackSite, isMcpEnabled: false, abilities: catalog } );
		render( <AIToolsSettings siteSlug={ jetpackSite.slug } />, { queryClient } );

		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows saved groups with a notice when the catalog cannot be loaded', async () => {
		seedQueries( {
			activeSite: jetpackSite,
			remoteGroups: { 'read:jetpack-backup': true },
		} );
		const failureScope = mockCatalogFailure( jetpackSite );
		render( <AIToolsSettings siteSlug={ jetpackSite.slug } />, { queryClient } );

		expect( await screen.findByText( /can’t be loaded right now/ ) ).toBeVisible();
		const backup = getNamespaceGroup( 'jetpack-backup' );
		expect( backup.getByRole( 'checkbox', { name: 'Read' } ) ).toBeChecked();

		await waitFor( () => {
			expect( failureScope.isDone() ).toBe( true );
		} );
	} );

	test( 'hides the section when the catalog cannot be loaded and nothing is saved', async () => {
		seedQueries( { activeSite: jetpackSite } );
		const failureScope = mockCatalogFailure( jetpackSite );
		render( <AIToolsSettings siteSlug={ jetpackSite.slug } />, { queryClient } );

		await waitFor( () => {
			expect( failureScope.isDone() ).toBe( true );
		} );
		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );
} );
