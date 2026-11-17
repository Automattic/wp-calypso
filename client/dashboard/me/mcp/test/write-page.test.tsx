/**
 * @vitest-environment jsdom
 */

import { isAutomatticianQuery, queryClient, userSettingsQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import McpWrite from '../write';
import type { UserSettings } from '@automattic/api-core';

function seed() {
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			account: {
				'wpcom-mcp/post-create': {
					enabled: true,
					readonly: false,
					visible: true,
					title: 'Create post',
					description: 'Create a post on a site.',
					group: 'content-authoring',
				},
				'wpcom-mcp/post-delete': {
					enabled: false,
					readonly: false,
					visible: true,
					title: 'Delete post',
					description: 'Delete a post on a site.',
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

// jsdom doesn't implement scrollIntoView, so define it for the test and
// remove it again afterwards.
function mockScrollIntoView() {
	const scrollIntoView = vi.fn();
	Object.defineProperty( Element.prototype, 'scrollIntoView', {
		value: scrollIntoView,
		configurable: true,
		writable: true,
	} );
	return scrollIntoView;
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

afterEach( () => {
	delete ( Element.prototype as Partial< Element > ).scrollIntoView;
} );

describe( '<McpWrite> anchors', () => {
	test( 'a tool anchor in a collapsed group scrolls to that tool once it renders', () => {
		const scrollIntoView = mockScrollIntoView();
		window.location.hash = '#wpcom-mcp/post-delete';
		seed();
		render( <McpWrite />, { queryClient } );

		expect( screen.getByRole( 'checkbox', { name: 'Delete post' } ) ).toBeVisible();
		expect( scrollIntoView ).toHaveBeenCalledTimes( 1 );
		expect( scrollIntoView.mock.contexts[ 0 ] ).toBe(
			document.getElementById( 'wpcom-mcp/post-delete' )
		);
	} );

	test( 'a tool anchor focuses the linked tool', () => {
		mockScrollIntoView();
		window.location.hash = '#wpcom-mcp/post-delete';
		seed();
		render( <McpWrite />, { queryClient } );

		expect( document.getElementById( 'wpcom-mcp/post-delete' ) ).toHaveFocus();
	} );
} );
