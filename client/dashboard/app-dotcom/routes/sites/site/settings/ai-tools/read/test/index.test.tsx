/**
 * @vitest-environment jsdom
 */

import {
	queryClient,
	siteAbilitiesQuery,
	siteBySlugQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import SiteAIToolsRead from '..';
import { render } from '../../../../../../../../test-utils';
import SiteAIToolsWrite from '../../write';
import type { Site, UserSettings } from '@automattic/api-core';

const JETPACK_SITE = {
	ID: 789,
	slug: 'remote-jetpack.example.com',
	name: 'Remote Jetpack',
	jetpack: true,
} as unknown as Site;

const OPT_IN_TOOL = {
	'wpcom-mcp/subscribers-list': {
		enabled: false,
		readonly: true,
		visible: true,
		requires_opt_in: true,
		title: 'List subscribers',
		description: 'List the subscribers of your sites.',
		group: 'content-authoring',
	},
};

function seed(
	extraAccountTools: Record< string, unknown > = {},
	siteAbilities: Record< string, boolean > = {},
	remoteGroups?: Record< string, boolean >
) {
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
				...extraAccountTools,
			},
			groups: [
				{
					name: 'content-authoring',
					label: 'Content Authoring',
					description: 'Create and manage content.',
					order: 1,
				},
			],
			sites: [
				{
					blog_id: JETPACK_SITE.ID,
					site_level_enabled: true,
					abilities: siteAbilities,
					remote_groups: remoteGroups,
				},
			],
		},
	} as unknown as UserSettings );
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

	test.each( [
		[ 'omitted', undefined ],
		[ 'reset', null ],
	] )(
		'Read and Write inherit site access when the site override is %s',
		( _label, siteEnabled ) => {
			queryClient.setQueryData(
				siteBySlugQuery( undefined as unknown as string ).queryKey,
				JETPACK_SITE
			);
			queryClient.setQueryData( userSettingsQuery().queryKey, {
				mcp_abilities: {
					site_level_enabled_default: true,
					account: {
						'wpcom-mcp/posts-list': { enabled: true, readonly: true, visible: true },
						'wpcom-mcp/posts-create': { enabled: true, readonly: false, visible: true },
					},
					sites: [
						{
							blog_id: JETPACK_SITE.ID,
							...( siteEnabled === null ? { site_level_enabled: null } : {} ),
							remote_groups: { 'read:jetpack-stats': false },
						},
					],
				},
			} as unknown as UserSettings );
			queryClient.setQueryData( siteAbilitiesQuery( JETPACK_SITE.ID, 'en_US' ).queryKey, [
				{
					name: 'jetpack-stats/get-views',
					label: 'Get views',
					meta: { annotations: { readonly: true } },
				},
				{
					name: 'mailpoet/get-subscribers',
					label: 'Get subscribers',
					meta: { annotations: { readonly: true } },
				},
				{
					name: 'mailpoet/send-email',
					label: 'Send email',
					meta: { annotations: {} },
				},
			] );

			const { unmount } = render( <SiteAIToolsRead />, { queryClient } );
			const getGroupToggle = ( name: string ) => {
				const card = screen.getByRole( 'heading', { name } ).closest( 'div[id]' );
				return within( card as HTMLElement ).getByRole( 'checkbox', { name: 'Enable all' } );
			};
			expect( getGroupToggle( 'Jetpack Stats' ) ).not.toBeChecked();
			expect( getGroupToggle( 'Mailpoet' ) ).toBeChecked();
			unmount();

			render( <SiteAIToolsWrite />, { queryClient } );
			expect( getGroupToggle( 'Mailpoet' ) ).toBeChecked();
		}
	);

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

	test.each( [
		{ scope: 'page', toggleIndex: 0, expected: true, individual: false },
		{ scope: 'namespace', toggleIndex: 2, expected: false, individual: true },
	] )( '$scope Enable all preserves the saved subscriber choice', async ( row ) => {
		const user = userEvent.setup();
		seed(
			{},
			{},
			{
				'read:jetpack-stats': true,
				'read:jetpack-stats/get-subscribers': row.individual,
			}
		);
		const statsAbilities = [
			[ 'get-subscribers', 'List remote subscribers' ],
			[ 'get-views', 'Get views' ],
		].map( ( [ name, label ] ) => ( {
			name: `jetpack-stats/${ name }`,
			label,
			meta: { annotations: { readonly: true } },
		} ) );
		queryClient.setQueryData(
			siteAbilitiesQuery( JETPACK_SITE.ID, 'en_US' ).queryKey,
			statsAbilities
		);
		render( <SiteAIToolsRead />, { queryClient } );

		for ( const expand of screen.getAllByRole( 'button', { name: 'Show operations' } ) ) {
			await user.click( expand );
		}
		expect(
			screen.getByRole( 'checkbox', { name: 'List remote subscribers', checked: row.individual } )
		).toBeVisible();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body.mcp_abilities.sites[ 0 ].remote_groups ).toEqual( {
					'read:jetpack-stats': row.expected,
				} );
				return true;
			} )
			.reply( 200, { mcp_abilities: {} } );
		await user.click(
			screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ row.toggleIndex ]
		);
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'shows which tools are skipped at page and group level and labels the opt-in tool in its group', async () => {
		const user = userEvent.setup();
		seed( OPT_IN_TOOL );
		render( <SiteAIToolsRead />, { queryClient } );

		const [ pageToggle, groupToggle ] = screen.getAllByRole( 'checkbox', { name: 'Enable all' } );
		const help =
			'This switch skips 1 tool that needs separate approval. Turn it on or off by itself.';
		expect( pageToggle ).toHaveAccessibleDescription( help );
		expect( groupToggle ).toHaveAccessibleDescription( help );

		const [ groupButton ] = screen.getAllByRole( 'button', { name: 'Show operations' } );
		await user.click( groupButton );
		const optInToggle = screen.getByRole( 'checkbox', { name: 'List subscribers' } );
		expect( optInToggle ).toHaveAccessibleDescription(
			'List the subscribers of your sites. This tool needs separate approval, so “Enable all” skips it.'
		);
		await user.click( screen.getByRole( 'button', { name: 'Turn on separately' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Turn on separately' } );
		expect( dialog ).toBeVisible();
		expect( dialog ).toHaveTextContent(
			'This tool needs separate approval, so “Enable all” skips it.'
		);
		expect( optInToggle ).not.toBeChecked();
	} );

	test( 'uses the plural skipped-tools copy when a scope has multiple opt-in tools', () => {
		seed( {
			...OPT_IN_TOOL,
			'wpcom-mcp/subscribers-export': {
				...OPT_IN_TOOL[ 'wpcom-mcp/subscribers-list' ],
				title: 'Export subscribers',
			},
		} );
		render( <SiteAIToolsRead />, { queryClient } );

		const [ pageToggle, groupToggle ] = screen.getAllByRole( 'checkbox', { name: 'Enable all' } );
		const pluralHelp =
			'This switch skips 2 tools that need separate approval. Turn them on or off one at a time.';
		expect( pageToggle ).toHaveAccessibleDescription( pluralHelp );
		expect( groupToggle ).toHaveAccessibleDescription( pluralHelp );
	} );

	test( 'a group of only opt-in tools has no Enable all switch', () => {
		seed();
		const { unmount } = render( <SiteAIToolsRead />, { queryClient } );
		const togglesWithoutOptIn = screen.getAllByRole( 'checkbox', { name: 'Enable all' } ).length;
		unmount();

		seed( {
			'wpcom-mcp/subscribers-list': {
				...OPT_IN_TOOL[ 'wpcom-mcp/subscribers-list' ],
				group: null,
			},
		} );
		render( <SiteAIToolsRead />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Other' } ) ).toBeVisible();
		expect( screen.getAllByRole( 'checkbox', { name: 'Enable all' } ) ).toHaveLength(
			togglesWithoutOptIn
		);
	} );

	test( 'the page-level Enable all leaves an opt-in tool off', async () => {
		const user = userEvent.setup();
		seed( OPT_IN_TOOL );
		render( <SiteAIToolsRead />, { queryClient } );

		// Same body as without the opt-in tool: it gets no site value, so it keeps its account state.
		const saveScope = mockPageSave();
		await user.click( screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ 0 ] );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
	} );

	test.each( [ true, false ] )(
		'setting a mixed group to %s saves only ordinary tools',
		async ( enabled ) => {
			const user = userEvent.setup();
			seed( OPT_IN_TOOL, {
				'wpcom-mcp/posts-list': ! enabled,
				'wpcom-mcp/pages-list': ! enabled,
				'wpcom-mcp/subscribers-list': ! enabled,
			} );
			render( <SiteAIToolsRead />, { queryClient } );

			const saveScope = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/settings', {
					mcp_abilities: {
						sites: [
							{
								blog_id: JETPACK_SITE.ID,
								abilities: { 'wpcom-mcp/posts-list': enabled, 'wpcom-mcp/pages-list': enabled },
							},
						],
					},
				} )
				.reply( 200, {} );
			await user.click( screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ 1 ] );

			await waitFor( () => expect( saveScope.isDone() ).toBe( true ) );
		}
	);

	test( 'an opt-in tool that is off leaves unsaved site-published abilities on', () => {
		seed( OPT_IN_TOOL, { 'wpcom-mcp/posts-list': true, 'wpcom-mcp/pages-list': true } );
		render( <SiteAIToolsRead />, { queryClient } );

		// The page-level toggle is on only when the site's unsaved ability counts as on too.
		expect( screen.getAllByRole( 'checkbox', { name: 'Enable all' } )[ 0 ] ).toBeChecked();
	} );
} );
