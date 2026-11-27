/** @vitest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { getBuildWowApiOverride } from '../poller';
import { subscribeToBuildWowStream } from '../stream/subscribe';
import { useBuildWowStream } from '../stream/use-build-wow-stream';
import type { BuildWowStreamInfo } from '../stream/types';

vi.mock( '../poller', () => ( { getBuildWowApiOverride: vi.fn() } ) );
vi.mock( '../stream/subscribe', () => ( {
	subscribeToBuildWowStream: vi.fn( () => () => {} ),
} ) );
vi.mock( 'calypso/landing/stepper/utils/build-wow', () => ( { logBuildWowEvent: vi.fn() } ) );
const mockCreateAuthProvider = vi.fn( () => async () => ( {
	Authorization: 'Bearer wpcom-token',
} ) );
vi.mock( '@automattic/agents-manager/src/auth/calypso-auth-provider', () => ( {
	createCalypsoAuthProvider: ( ...args: unknown[] ) => mockCreateAuthProvider( ...( args as [] ) ),
} ) );

const info: BuildWowStreamInfo = {
	protocol: 1,
	blogId: 123,
	runId: 'run-1',
	capabilities: [ 'preview:dsl-html' ],
	eventsUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/events',
	snapshotUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/snapshot',
	previewUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/preview',
};

// The authorize callback the hook hands to the feed subscription.
function subscribedAuthorize(): () => Promise< string | null > {
	const calls = ( subscribeToBuildWowStream as Mock ).mock.calls;
	return calls[ calls.length - 1 ][ 0 ].authorize;
}

beforeEach( () => {
	vi.clearAllMocks();
} );

it( 'authorizes a WordPress.com feed with the signed-in WordPress.com credential', async () => {
	( getBuildWowApiOverride as Mock ).mockReturnValue( null );
	renderHook( () => useBuildWowStream( info ) );
	await expect( subscribedAuthorize()() ).resolves.toBe( 'Bearer wpcom-token' );
	expect( mockCreateAuthProvider ).toHaveBeenCalledWith( 123 );
} );

it( 'sends a placeholder, and mints no credential, for a feed from a local status server', async () => {
	( getBuildWowApiOverride as Mock ).mockReturnValue( 'http://127.0.0.1:4001/api/calypso' );
	renderHook( () => useBuildWowStream( info ) );
	const authorization = await subscribedAuthorize()();
	expect( authorization ).toMatch( /^Bearer \S+$/ );
	expect( authorization ).not.toContain( 'wpcom-token' );
	expect( mockCreateAuthProvider ).not.toHaveBeenCalled();
} );
