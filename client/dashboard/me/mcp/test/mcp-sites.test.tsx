/** @jest-environment jsdom */
import { queryClient, userSettingsQuery } from '@automattic/api-queries';
import { screen } from '@testing-library/react';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import McpMcpSites from '../mcp-sites';
import type { Site, UserSettings } from '@automattic/api-core';

// Route.fullPath only initializes once a router processes the route tree, so in
// this harness the component passes to={ undefined }. Mirror the production
// template (/sites/$siteSlug/settings/ai-tools) and substitute the params the
// component supplies, which is the part under test here.
jest.mock( '../../../components/router-link-button', () => ( {
	__esModule: true,
	default: ( {
		params,
		children,
		...props
	}: {
		params?: { siteSlug?: string };
		children: React.ReactNode;
	} ) => (
		<a { ...props } href={ `/sites/${ params?.siteSlug }/settings/ai-tools` }>
			{ children }
		</a>
	),
} ) );

const SELF_HOSTED_SITE = {
	ID: 11,
	slug: 'self-hosted.example.com',
	name: 'Self Hosted',
	URL: 'https://self-hosted.example.com',
	jetpack: true,
	jetpack_connection: true,
	is_wpcom_atomic: false,
	options: { admin_url: 'https://self-hosted.example.com/wp-admin' },
	capabilities: { manage_options: true },
	site_migration: { in_progress: false, is_complete: false },
} as unknown as Site;

const ATOMIC_SITE = {
	...SELF_HOSTED_SITE,
	ID: 22,
	slug: 'atomic-site.wpcomstaging.com',
	name: 'Atomic',
	URL: 'https://atomic-site.wpcomstaging.com',
	is_wpcom_atomic: true,
	options: { admin_url: 'https://atomic-site.wpcomstaging.com/wp-admin/' },
} as Site;

const SIMPLE_SITE = {
	...SELF_HOSTED_SITE,
	ID: 33,
	slug: 'simple-site.wordpress.com',
	name: 'Simple',
	URL: 'https://simple-site.wordpress.com',
	jetpack: false,
	jetpack_connection: false,
	options: { admin_url: 'https://simple-site.wordpress.com/wp-admin/' },
} as Site;

const sitesQuery = APP_CONTEXT_DEFAULT_CONFIG.queries.sitesQuery( {
	site_visibility: 'visible',
	include_a8c_owned: false,
} );

function seed( site: Site ) {
	queryClient.setQueryData( sitesQuery.queryKey, [ site ] );
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			account: {
				'wpcom-mcp/posts-list': {
					enabled: true,
					title: 'List posts',
					description: 'List posts on your sites.',
				},
			},
			sites: [ { blog_id: site.ID, site_level_enabled: false } ],
		},
	} as unknown as UserSettings );
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

describe( '<McpMcpSites> Manage link', () => {
	test( 'links a self-hosted Jetpack site to its wp-admin MCP page', () => {
		seed( SELF_HOSTED_SITE );
		render( <McpMcpSites />, { queryClient } );

		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			'https://self-hosted.example.com/wp-admin/admin.php?page=jetpack-ai#/mcp'
		);
	} );

	test( 'links an Atomic site to the dashboard AI tools route', () => {
		seed( ATOMIC_SITE );
		render( <McpMcpSites />, { queryClient } );

		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			`/sites/${ ATOMIC_SITE.slug }/settings/ai-tools`
		);
	} );

	test( 'links a Simple site to the dashboard AI tools route', () => {
		seed( SIMPLE_SITE );
		render( <McpMcpSites />, { queryClient } );

		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			`/sites/${ SIMPLE_SITE.slug }/settings/ai-tools`
		);
	} );

	test( 'hides the link for a self-hosted site without manage_options', () => {
		seed( {
			...SELF_HOSTED_SITE,
			capabilities: { manage_options: false },
		} as unknown as Site );
		render( <McpMcpSites />, { queryClient } );

		expect( screen.getByText( 'Self Hosted' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Manage' } ) ).not.toBeInTheDocument();
	} );

	test( 'hides the link when the site has no admin URL', () => {
		seed( { ...SELF_HOSTED_SITE, options: {} } as unknown as Site );
		render( <McpMcpSites />, { queryClient } );

		expect( screen.getByText( 'Self Hosted' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Manage' } ) ).not.toBeInTheDocument();
	} );
} );
