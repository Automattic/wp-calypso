/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import McpToolsSubpage from '../tools-subpage';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => ( key === 'env_id' ? 'production' : null ) );
	config.isEnabled = jest.fn( () => true );
	return config;
} );

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: () => ( {
		queryKey: [ 'read', 'teams' ],
		queryFn: async () => true,
	} ),
	sitesQuery: () => ( {
		queryKey: [ 'sites' ],
		queryFn: async () => ( { sites: [] } ),
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
				groups: [],
				group_intents: {},
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

jest.mock( '../mcp-page-header', () => ( {
	useMcpPageChrome: () => ( {
		documentTitle: 'AI and MCP',
		navigationHeaderProps: {},
	} ),
} ) );

jest.mock( 'calypso/lib/analytics/page-view-tracker', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );

async function toggleFirstTool( props ) {
	const user = userEvent.setup();
	renderWithProvider( <McpToolsSubpage { ...props } /> );

	// Groups render collapsed; expand the "Other" bucket to reach the tool toggle.
	await user.click( await screen.findByRole( 'button', { name: 'Show operations' } ) );
	await user.click( await screen.findByRole( 'checkbox', { name: 'List posts' } ) );
}

function getToolToggledPayload( eventName ) {
	const call = recordTracksEvent.mock.calls.find( ( [ name ] ) => name === eventName );
	return call?.[ 1 ];
}

describe( 'client/me/mcp/tools-subpage Tracks payloads', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'fires calypso_dashboard_mcp_read_tool_toggled with ability_name and path', async () => {
		await toggleFirstTool( {
			path: '/me/mcp/read',
			pageViewTitle: 'MCP Read Access',
			headerTitle: 'Read',
			filterTool: () => true,
			toolCategory: 'read',
		} );

		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_mcp_read_tool_toggled',
				expect.objectContaining( {
					path: '/me/mcp/read',
					ability_name: 'wpcom-mcp/posts-list',
					enabled: true,
					group: 'other',
					is_a11n: 'true',
					is_test: 'false',
				} )
			)
		);
		expect( getToolToggledPayload( 'calypso_dashboard_mcp_read_tool_toggled' ) ).not.toHaveProperty(
			'tool_id'
		);
	} );

	it( 'fires calypso_dashboard_mcp_write_tool_toggled with ability_name and path', async () => {
		await toggleFirstTool( {
			path: '/me/mcp/write',
			pageViewTitle: 'MCP Write Access',
			headerTitle: 'Write',
			filterTool: () => true,
			toolCategory: 'write',
		} );

		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_mcp_write_tool_toggled',
				expect.objectContaining( {
					path: '/me/mcp/write',
					ability_name: 'wpcom-mcp/posts-list',
					enabled: true,
					group: 'other',
					is_a11n: 'true',
					is_test: 'false',
				} )
			)
		);
		expect(
			getToolToggledPayload( 'calypso_dashboard_mcp_write_tool_toggled' )
		).not.toHaveProperty( 'tool_id' );
	} );
} );
