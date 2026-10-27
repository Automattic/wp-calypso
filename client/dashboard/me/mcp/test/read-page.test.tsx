/**
 * @jest-environment jsdom
 */

import { isAutomatticianQuery, queryClient, userSettingsQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import McpRead from '../read';
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
				'wpcom-mcp/pages-list': {
					enabled: false,
					readonly: true,
					visible: true,
					title: 'List pages',
					description: 'List pages on your sites.',
					group: 'content-authoring',
				},
				'wpcom-mcp/post-create': {
					enabled: false,
					readonly: false,
					visible: true,
					title: 'Create post',
					description: 'Create a post on a site.',
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
	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: 0,
		teams: [ { slug: 'a8c' } ],
	} );
}

function mockClipboard() {
	const writeText = jest.fn().mockResolvedValue( undefined );
	Object.defineProperty( window.navigator, 'clipboard', {
		value: { writeText },
		configurable: true,
	} );
	return writeText;
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
		mutations: { retry: false },
	} );
} );

describe( '<McpRead> search and anchors', () => {
	test( 'search filters tools and renders groups open', async () => {
		const user = userEvent.setup();
		seed();
		render( <McpRead />, { queryClient } );

		expect( screen.queryByRole( 'checkbox', { name: 'List pages' } ) ).not.toBeInTheDocument();

		await user.type( screen.getByRole( 'searchbox' ), 'pages' );

		expect( await screen.findByRole( 'checkbox', { name: 'List pages' } ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: 'List posts' } ) ).not.toBeInTheDocument();
	} );

	test( 'a tool anchor opens its group and keeps the other tools visible', () => {
		window.location.hash = '#wpcom-mcp/pages-list';
		seed();
		render( <McpRead />, { queryClient } );

		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
		expect( screen.getByRole( 'checkbox', { name: 'List pages' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'List posts' } ) ).toBeVisible();
		expect( document.getElementById( 'wpcom-mcp/pages-list' ) ).not.toBeNull();
	} );

	test( 'an anchor copy button copies that tool’s anchor URL', async () => {
		const user = userEvent.setup();
		const writeText = mockClipboard();
		seed();
		render( <McpRead />, { queryClient } );

		await user.click( screen.getByRole( 'button', { name: 'Show operations' } ) );
		await user.click( screen.getAllByRole( 'button', { name: 'Copy link to this setting' } )[ 0 ] );

		expect( writeText ).toHaveBeenCalledWith(
			`${ window.location.origin }${ window.location.pathname }#wpcom-mcp/posts-list`
		);
	} );
} );
