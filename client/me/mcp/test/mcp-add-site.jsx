/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import McpAddSitePage from '../mcp-add-site';

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( () => null );
	config.isEnabled = jest.fn( () => true );
	return config;
} );

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
};

let mockSites = [ SELF_HOSTED_SITE ];

jest.mock( '@automattic/api-queries', () => ( {
	sitesQuery: () => ( {
		queryKey: [ 'sites' ],
		queryFn: async () => mockSites,
	} ),
	userSettingsQuery: () => ( {
		queryKey: [ 'me', 'settings' ],
		queryFn: async () => ( {
			mcp_abilities: {
				account: {
					'wpcom-mcp/posts-list': {
						enabled: false,
						readonly: true,
						title: 'List posts',
						description: 'List posts on your sites.',
					},
				},
				sites: [ { blog_id: 11, site_level_enabled: true } ],
			},
		} ),
	} ),
	userSettingsMutation: () => ( {
		mutationFn: async () => ( {} ),
	} ),
} ) );

jest.mock( 'calypso/lib/two-step-authorization', () => ( {
	__esModule: true,
	default: {
		isReauthRequired: () => false,
		on: jest.fn(),
		off: jest.fn(),
	},
} ) );

jest.mock( 'calypso/me/reauth-required', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/header-cake', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/lib/analytics/page-view-tracker', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '../mcp-page-header', () => ( {
	useMcpPageChrome: () => ( {
		documentTitle: 'AI and MCP',
		navigationHeaderProps: {},
	} ),
} ) );

function renderPage() {
	return renderWithProvider( <McpAddSitePage path="/me/mcp/add-site" /> );
}

describe( '<McpAddSitePage> Manage link', () => {
	beforeEach( () => {
		mockSites = [ SELF_HOSTED_SITE ];
	} );

	it( 'links a self-hosted Jetpack site to its wp-admin MCP page', async () => {
		renderPage();

		expect( await screen.findByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			'https://self-hosted.example.com/wp-admin/admin.php?page=jetpack-ai#/mcp'
		);
	} );

	it( 'links an Atomic site to the dashboard AI tools route', async () => {
		mockSites = [
			{
				...SELF_HOSTED_SITE,
				is_wpcom_atomic: true,
				slug: 'atomic-site.wpcomstaging.com',
				URL: 'https://atomic-site.wpcomstaging.com',
				options: { admin_url: 'https://atomic-site.wpcomstaging.com/wp-admin/' },
			},
		];
		renderPage();

		expect( await screen.findByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			'/sites/atomic-site.wpcomstaging.com/settings/ai-tools'
		);
	} );

	it( 'links a Simple site to the dashboard AI tools route', async () => {
		mockSites = [
			{
				...SELF_HOSTED_SITE,
				jetpack: false,
				jetpack_connection: false,
				slug: 'simple-site.wordpress.com',
				URL: 'https://simple-site.wordpress.com',
				options: { admin_url: 'https://simple-site.wordpress.com/wp-admin/' },
			},
		];
		renderPage();

		expect( await screen.findByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute(
			'href',
			'/sites/simple-site.wordpress.com/settings/ai-tools'
		);
	} );

	it( 'hides the link for a self-hosted site without manage_options', async () => {
		mockSites = [ { ...SELF_HOSTED_SITE, capabilities: { manage_options: false } } ];
		renderPage();

		expect( await screen.findByText( 'Self Hosted' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Manage' } ) ).not.toBeInTheDocument();
	} );

	it( 'hides the link when the site has no admin URL', async () => {
		mockSites = [ { ...SELF_HOSTED_SITE, options: {} } ];
		renderPage();

		expect( await screen.findByText( 'Self Hosted' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Manage' } ) ).not.toBeInTheDocument();
	} );
} );
