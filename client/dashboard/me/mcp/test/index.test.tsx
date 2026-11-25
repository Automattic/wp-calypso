/**
 * @vitest-environment jsdom
 */

import { isAutomatticianQuery, queryClient, userSettingsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from '../../../test-utils';
import Mcp from '../index';
import type { UserSettings } from '@automattic/api-core';

function seed( enabled: boolean ) {
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {
			account: {
				'wpcom-mcp/posts-list': {
					enabled,
					readonly: true,
					visible: true,
					title: 'List posts',
					description: 'List posts on your sites.',
				},
				'wpcom-mcp/subscribers-list': {
					enabled,
					readonly: true,
					visible: true,
					requires_opt_in: true,
					title: 'List subscribers',
					description: 'List the subscribers of your sites.',
				},
			},
			groups: [],
		},
	} as unknown as UserSettings );
	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: 0,
		teams: [ { slug: 'a8c' } ],
	} );
}

beforeEach( () => {
	vi.spyOn( config, 'isEnabled' ).mockReturnValue( true );
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
	vi.restoreAllMocks();
} );

describe( '<McpComponent>', () => {
	test.each( [
		[ 'on leaves an opt-in tool alone', false, { 'wpcom-mcp/posts-list': true } ],
		[
			'off includes an opt-in tool',
			true,
			{ 'wpcom-mcp/posts-list': false, 'wpcom-mcp/subscribers-list': false },
		],
	] )( 'turning MCP access %s', async ( _label, initiallyEnabled, account ) => {
		const user = userEvent.setup();
		seed( initiallyEnabled );
		render( <Mcp />, { queryClient } );

		const saveScope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body.mcp_abilities.account ).toEqual( account );
				return true;
			} )
			.reply( 200, {} );

		await user.click( screen.getByRole( 'checkbox', { name: 'Enable MCP access' } ) );

		await waitFor( () => {
			expect( saveScope.isDone() ).toBe( true );
		} );
	} );
} );
