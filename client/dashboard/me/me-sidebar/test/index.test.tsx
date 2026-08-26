/**
 * @jest-environment jsdom
 */

import { queryClient, userSettingsQuery } from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import MeSidebar from '..';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import type { UserSettings } from '@automattic/api-core';

beforeAll( () => {
	enable( 'mcp-settings' );
} );

afterAll( () => {
	disable( 'mcp-settings' );
} );

beforeEach( () => {
	queryClient.clear();
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		avatar_URL: 'https://example.com/avatar.png',
		display_name: 'Test User',
		user_login: 'testuser',
	} as UserSettings );
} );

test( 'shows WordPress Agent separately from Apps', () => {
	render( <MeSidebar />, {
		queryClient,
		config: {
			...APP_CONTEXT_DEFAULT_CONFIG,
			supports: {
				...APP_CONTEXT_DEFAULT_CONFIG.supports,
				me: { billing: false, security: false, apps: true },
			},
		},
	} );

	expect( screen.getByRole( 'link', { name: 'WordPress Agent' } ) ).toHaveAttribute(
		'href',
		'/me/agent'
	);
	expect( screen.getByRole( 'link', { name: 'Apps' } ) ).toHaveAttribute( 'href', '/me/apps' );
} );
