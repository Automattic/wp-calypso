/**
 * @jest-environment jsdom
 */

import {
	isAutomatticianQuery,
	queryClient,
	siteAbilitiesQuery,
	siteBySlugQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteAIToolsRead from '../read';
import type { Site, UserSettings } from '@automattic/api-core';

const JETPACK_SITE = {
	ID: 789,
	slug: 'remote-jetpack.example.com',
	name: 'Remote Jetpack',
	jetpack: true,
} as unknown as Site;

function seed() {
	// The page reads siteSlug from useParams, which is undefined in this harness.
	queryClient.setQueryData(
		siteBySlugQuery( undefined as unknown as string ).queryKey,
		JETPACK_SITE
	);
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			account: {
				'wpcom-mcp/posts-list': {
					enabled: false,
					readonly: true,
					visible: true,
					title: 'List posts',
					description: 'List posts on your sites.',
					group: 'content-authoring',
				},
				'wpcom-mcp/pages-list': {
					enabled: false,
					readonly: true,
					visible: true,
					title: 'List pages',
					description: 'List pages on your sites.',
					group: 'content-authoring',
				},
			},
			groups: [
				{
					name: 'content-authoring',
					label: 'Content Authoring',
					description: 'Create and manage content.',
					order: 1,
				},
			],
			sites: [ { blog_id: JETPACK_SITE.ID, site_level_enabled: true, abilities: {} } ],
		},
	} as unknown as UserSettings );
	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: 0,
		teams: [ { slug: 'a8c' } ],
	} );
	queryClient.setQueryData( siteAbilitiesQuery( JETPACK_SITE.ID, 'en_US' ).queryKey, [
		{
			name: 'jetpack-forms/get-form',
			label: 'Get form',
			meta: { annotations: { readonly: true } },
		},
	] );
}

function mockPageSave() {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/settings', ( body ) => {
			expect( body.mcp_abilities.sites ).toHaveLength( 1 );
			expect( body.mcp_abilities.sites[ 0 ] ).toEqual( {
				blog_id: JETPACK_SITE.ID,
				abilities: { 'wpcom-mcp/posts-list': true, 'wpcom-mcp/pages-list': true },
				remote_groups: { 'read:jetpack-forms': true },
			} );
			return true;
		} )
		.reply( 200, {
			mcp_abilities: {
				sites: [
					{
						blog_id: JETPACK_SITE.ID,
						site_level_enabled: true,
						abilities: { 'wpcom-mcp/posts-list': true, 'wpcom-mcp/pages-list': true },
						remote_groups: { 'read:jetpack-forms': true },
					},
				],
			},
		} );
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
		mutations: { retry: false },
	} );
} );

describe( '<SiteAIToolsRead>', () => {
	test( 'groups wpcom tools by the server group descriptors, like the account page', () => {
		seed();
		render( <SiteAIToolsRead />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Content Authoring' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Site' } ) ).not.toBeInTheDocument();
	} );

	test( 'a tool anchor in the URL opens its group and keeps the other tools visible', () => {
		window.location.hash = '#wpcom-mcp/posts-list';
		seed();
		render( <SiteAIToolsRead />, { queryClient } );

		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
		expect( screen.getByRole( 'checkbox', { name: 'List posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'List pages' } ) ).toBeVisible();
	} );

	test( 'the page-level Enable all saves every tool and remote group on the page', async () => {
		const user = userEvent.setup();
		seed();
		render( <SiteAIToolsRead />, { queryClient } );

		const saveScope = mockPageSave();
		// The page-level toggle precedes the per-group intents in the document.
		await user.click( screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ 0 ] );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
	} );
} );
