/**
 * @jest-environment jsdom
 */

import { queryClient, userSettingsQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import McpSetup from '../setup';
import type { UserSettings } from '@automattic/api-core';

function seed() {
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			account: {
				'wpcom-mcp/posts-list': {
					enabled: true,
					readonly: true,
					visible: true,
					title: 'List posts',
					description: 'List posts on your sites.',
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

describe( '<McpSetup> Claude instructions', () => {
	test( 'Claude shows the Connectors flow and no manual JSON config', () => {
		seed();
		render( <McpSetup />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Quick setup' } ) ).toBeVisible();
		expect( screen.getByText( /Settings → Connectors/ ) ).toBeVisible();
		expect(
			screen.getByText( /The same steps work on claude\.ai and in the Claude Desktop app/ )
		).toBeVisible();

		// claude_desktop_config.json does not accept a url-only server, so the
		// manual JSON block must not be offered for Claude (MCP-538).
		expect( screen.queryByRole( 'heading', { name: 'Manual setup' } ) ).not.toBeInTheDocument();
		expect( screen.queryByDisplayValue( /public-api\.wordpress\.com/ ) ).not.toBeInTheDocument();

		// The developer-oriented MCP docs are not useful to someone adding a connector.
		expect( screen.queryByRole( 'link', { name: /documentation/i } ) ).not.toBeInTheDocument();
	} );

	test( 'Claude Code still offers the manual JSON config', async () => {
		const user = userEvent.setup();
		seed();
		render( <McpSetup />, { queryClient } );

		await user.selectOptions( screen.getByRole( 'combobox' ), 'claude-code' );

		expect( screen.getByRole( 'heading', { name: 'Manual setup' } ) ).toBeVisible();
		expect( screen.getByDisplayValue( /"type": "http"/ ) ).toBeVisible();
	} );
} );
