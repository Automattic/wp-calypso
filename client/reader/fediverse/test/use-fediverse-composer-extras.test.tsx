/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import {
	readerFediverseKeys,
	type FediverseConnectionsResponse,
	type FediverseCreatePostParams,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { useFediverseComposerExtras } from '../use-fediverse-composer-extras';
import type { ActiveMode } from 'calypso/reader/social/composer';

function seedConnections( client: QueryClient, response: FediverseConnectionsResponse ) {
	client.setQueryData( readerFediverseKeys.connections(), response );
}

function wrapperFor( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	entry_point: 'fab',
	connectionId: 1,
};

const baseConnection = {
	id: 1,
	blog_id: 100,
	url: 'https://example.com',
	name: 'Example',
	icon: '',
	webfinger: '@example@example.com',
};

beforeEach( () => {
	window.localStorage.clear();
} );

describe( 'useFediverseComposerExtras — extendBuildParams visibility merge', () => {
	it( 'merges the cached connection’s default_visibility into the wire params', () => {
		// Regression guard for the reviewer concern: `composer-config.tsx`'s
		// `buildParams` returns `{ visibility: 'public' }` as a placeholder
		// and relies on `extendBuildParams` to override. If the extras wiring
		// regresses, the wire silently ships `visibility: 'public'`. This
		// test exercises the merge path end-to-end at the hook surface.
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, default_visibility: 'unlisted' } ],
		} );

		const { result } = renderHook(
			() => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: FediverseCreatePostParams = {
			connectionId: 1,
			content: 'hello',
			visibility: 'public',
		};
		const merged = result.current.extendBuildParams( base ) as FediverseCreatePostParams;
		expect( merged.visibility ).toBe( 'unlisted' );
	} );

	it( 'localStorage override beats the cached blog default', () => {
		window.localStorage.setItem( 'calypso_reader_fediverse_composer_visibility_v1:1', 'followers' );
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, default_visibility: 'unlisted' } ],
		} );

		const { result } = renderHook(
			() => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: FediverseCreatePostParams = {
			connectionId: 1,
			content: 'hello',
			visibility: 'public',
		};
		const merged = result.current.extendBuildParams( base ) as FediverseCreatePostParams;
		expect( merged.visibility ).toBe( 'followers' );
	} );

	it( 'falls back to `public` when the cache is cold and no localStorage pick', () => {
		const client = new QueryClient();
		// No seed.

		const { result } = renderHook(
			() => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: FediverseCreatePostParams = {
			connectionId: 1,
			content: 'hello',
			visibility: 'public',
		};
		const merged = result.current.extendBuildParams( base ) as FediverseCreatePostParams;
		expect( merged.visibility ).toBe( 'public' );
	} );

	it( 'mints a fresh idempotencyKey on every call (no cross-submit reuse)', () => {
		const client = new QueryClient();
		seedConnections( client, { connections: [ baseConnection ] } );

		const { result } = renderHook(
			() => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: FediverseCreatePostParams = {
			connectionId: 1,
			content: 'hello',
			visibility: 'public',
		};
		const a = result.current.extendBuildParams( base ) as FediverseCreatePostParams;
		const b = result.current.extendBuildParams( base ) as FediverseCreatePostParams;
		expect( a.idempotencyKey ).toBeDefined();
		expect( b.idempotencyKey ).toBeDefined();
		expect( a.idempotencyKey ).not.toBe( b.idempotencyKey );
	} );

	it( 'logs a breadcrumb when `data.connections` is missing from the response', () => {
		const { logToLogstash } = jest.requireMock( 'calypso/lib/logstash' ) as {
			logToLogstash: jest.Mock;
		};
		logToLogstash.mockClear();

		const client = new QueryClient();
		// Seed a malformed response — `data` present, `connections` missing.
		client.setQueryData(
			readerFediverseKeys.connections(),
			{} as unknown as FediverseConnectionsResponse
		);

		renderHook( () => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ), {
			wrapper: wrapperFor( client ),
		} );

		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: expect.stringContaining( 'missing `connections` array' ),
				extra: expect.objectContaining( {
					type: 'reader_fediverse_connections_malformed',
				} ),
			} )
		);
	} );

	it( 'persists the user’s visibility pick to localStorage', () => {
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, default_visibility: 'public' } ],
		} );

		const { result } = renderHook(
			() => useFediverseComposerExtras( { mode: standaloneMode, connectionId: 1 } ),
			{ wrapper: wrapperFor( client ) }
		);

		// Render the controls slot — its onVisibilityChange handler is what
		// writes to localStorage. We invoke that handler through the returned
		// React element by reading it directly.
		const element = result.current.renderControls() as React.ReactElement< {
			onVisibilityChange: ( next: string ) => void;
		} >;
		act( () => {
			element.props.onVisibilityChange( 'followers' );
		} );

		expect(
			window.localStorage.getItem( 'calypso_reader_fediverse_composer_visibility_v1:1' )
		).toBe( 'followers' );
	} );
} );
