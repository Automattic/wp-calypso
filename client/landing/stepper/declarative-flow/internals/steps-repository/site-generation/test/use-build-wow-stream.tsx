/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { getBuildWowApiOverride } from '../poller';
import { subscribeToBuildWowStream } from '../stream/subscribe';
import { useBuildWowStream } from '../stream/use-build-wow-stream';
import type { BuildWowStreamInfo } from '../stream/types';

jest.mock( '../poller', () => ( { getBuildWowApiOverride: jest.fn() } ) );
jest.mock( '../stream/subscribe', () => ( {
	subscribeToBuildWowStream: jest.fn( () => () => {} ),
} ) );
jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( { logBuildWowEvent: jest.fn() } ) );
const mockCreateAuthProvider = jest.fn( () => async () => ( {
	Authorization: 'Bearer wpcom-token',
} ) );
jest.mock( '@automattic/agents-manager/src/auth/calypso-auth-provider', () => ( {
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
	const calls = ( subscribeToBuildWowStream as jest.Mock ).mock.calls;
	return calls[ calls.length - 1 ][ 0 ].authorize;
}

beforeEach( () => {
	jest.clearAllMocks();
} );

it( 'authorizes a WordPress.com feed with the signed-in WordPress.com credential', async () => {
	( getBuildWowApiOverride as jest.Mock ).mockReturnValue( null );
	renderHook( () => useBuildWowStream( info ) );
	await expect( subscribedAuthorize()() ).resolves.toBe( 'Bearer wpcom-token' );
	expect( mockCreateAuthProvider ).toHaveBeenCalledWith( 123 );
} );

it( 'sends a placeholder, and mints no credential, for a feed from a local status server', async () => {
	( getBuildWowApiOverride as jest.Mock ).mockReturnValue( 'http://127.0.0.1:4001/api/calypso' );
	renderHook( () => useBuildWowStream( info ) );
	const authorization = await subscribedAuthorize()();
	expect( authorization ).toMatch( /^Bearer \S+$/ );
	expect( authorization ).not.toContain( 'wpcom-token' );
	expect( mockCreateAuthProvider ).not.toHaveBeenCalled();
} );
