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
import RemoteAbilitiesCard from '../remote-abilities-card';
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
						remote_groups: expectedGroups,
					},
				],
			},
		} );
}

function getNamespaceToggle( namespace: string ) {
	const heading = screen.getByRole( 'heading', { name: namespace } );
	return within( heading.parentElement as HTMLElement ).getByRole( 'checkbox', {
		name: 'Enable all',
	} );
}

function getCardToggle() {
	// The card-level Enable all precedes the per-namespace toggles in the document.
	return screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ 0 ];
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

describe( '<RemoteAbilitiesCard>', () => {
	test( 'read card lists read abilities with labels and descriptions, excluding writes', () => {
		seed( { abilities: catalog, remoteGroups: { 'read:jetpack-forms': true } } );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="read" />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Site-published abilities' } ) ).toBeVisible();
		expect( getNamespaceToggle( 'Jetpack Forms' ) ).toBeChecked();
		expect( screen.getByText( 'Get form' ) ).toBeVisible();
		expect( screen.getByText( 'Read a single form.' ) ).toBeVisible();
		expect( screen.queryByText( 'Update form' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Delete form' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Akismet' } ) ).not.toBeInTheDocument();
	} );

	test( 'write card lists write and destructive abilities with no destructive labeling', () => {
		seed( { abilities: catalog, remoteGroups: { 'write:akismet': true } } );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( getNamespaceToggle( 'Akismet' ) ).toBeChecked();
		expect( getNamespaceToggle( 'Jetpack Forms' ) ).not.toBeChecked();
		expect( screen.getByText( 'Update form' ) ).toBeVisible();
		expect( screen.getByText( 'Change a form’s fields.' ) ).toBeVisible();
		expect( screen.getByText( 'Delete form' ) ).toBeVisible();
		expect( screen.getByText( 'Delete a form and its responses.' ) ).toBeVisible();
		expect( screen.getByText( 'Check comment' ) ).toBeVisible();
		expect( screen.queryByText( 'Get form' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Destructive' ) ).not.toBeInTheDocument();
	} );

	test( 'a namespace toggle saves every group key it covers, destructive included', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog } );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="write" />, { queryClient } );

		const saveScope = mockRemoteGroupsSave( JETPACK_SITE, {
			'write:jetpack-forms': true,
			'destructive:jetpack-forms': true,
		} );
		await user.click( getNamespaceToggle( 'Jetpack Forms' ) );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( getNamespaceToggle( 'Jetpack Forms' ) ).toBeChecked();
		} );
	} );

	test( 'the card-level Enable all saves every group key on the page', async () => {
		const user = userEvent.setup();
		seed( { abilities: catalog, remoteGroups: { 'write:akismet': true } } );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( getCardToggle() ).not.toBeChecked();

		const saveScope = mockRemoteGroupsSave( JETPACK_SITE, {
			'write:akismet': true,
			'write:jetpack-forms': true,
			'destructive:jetpack-forms': true,
		} );
		await user.click( getCardToggle() );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( getCardToggle() ).toBeChecked();
			expect( getNamespaceToggle( 'Jetpack Forms' ) ).toBeChecked();
		} );
	} );

	test( 'shows saved groups with a notice when the catalog cannot be loaded', async () => {
		seed( { remoteGroups: { 'write:akismet': true } } );
		const failureScope = mockCatalogFailure( JETPACK_SITE );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="write" />, { queryClient } );

		expect( await screen.findByText( /can’t be loaded right now/ ) ).toBeVisible();
		expect( getNamespaceToggle( 'Akismet' ) ).toBeChecked();
		expect( screen.queryByText( 'Check comment' ) ).not.toBeInTheDocument();

		await waitFor( () => {
			expect( failureScope.isDone() ).toBe( true );
		} );
	} );

	test( 'hides when the site publishes nothing and nothing is saved', () => {
		seed( { abilities: [] } );
		render( <RemoteAbilitiesCard site={ JETPACK_SITE } category="read" />, { queryClient } );

		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );

	test( 'hides on Simple sites', () => {
		seed( { activeSite: SIMPLE_SITE, abilities: catalog } );
		render( <RemoteAbilitiesCard site={ SIMPLE_SITE } category="read" />, { queryClient } );

		expect(
			screen.queryByRole( 'heading', { name: 'Site-published abilities' } )
		).not.toBeInTheDocument();
	} );
} );
