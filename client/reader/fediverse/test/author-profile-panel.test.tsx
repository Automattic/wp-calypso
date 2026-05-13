/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as logstash from 'calypso/lib/logstash';
import * as notices from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseAuthorProfilePanel } from '../author-profile-panel';
import type { FediverseAuthorProfile, FediverseConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

// `logToLogstash` fires a real HTTPS request; mute it so the follow-error
// path doesn't trigger an unmocked-request alarm in nock.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn().mockResolvedValue( undefined ),
} ) );

const BASE = 'https://public-api.wordpress.com';

const connection: FediverseConnection = {
	id: 7,
	blog_id: 100,
	url: 'https://example.com',
	name: 'Example',
	icon: '',
	webfinger: '@example@example.com',
};

const ACTOR = 'alice@remote.example';

function makeProfile( overrides: Partial< FediverseAuthorProfile > = {} ): FediverseAuthorProfile {
	return {
		id: 'https://remote.example/users/alice',
		username: 'alice',
		acct: '@alice@remote.example',
		handle: '@alice@remote.example',
		instance: 'remote.example',
		display_name: 'Alice',
		note: '',
		avatar: null,
		header: null,
		url: 'https://remote.example/@alice',
		locked: false,
		counts: { followers: 12, following: 34, posts: 56 },
		// `viewer` / `is_self` are optional on the wire; tests opt in per case.
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function profileUrl() {
	return `/wpcom/v2/reader/fediverse/connections/7/profile/${ encodeURIComponent( ACTOR ) }`;
}

function feedUrl() {
	return `/wpcom/v2/reader/fediverse/connections/7/profile/${ encodeURIComponent(
		ACTOR
	) }/timeline`;
}

function stubProfile( overrides: Partial< FediverseAuthorProfile > = {} ) {
	// Wire response wraps the profile in a `{ profile: ... }` envelope —
	// the fetcher unwraps it before passing to `useFediverseAuthorProfileQuery`.
	return nock( BASE )
		.get( profileUrl() )
		.reply( 200, { profile: makeProfile( overrides ) } );
}

function stubFeed() {
	return nock( BASE ).get( feedUrl() ).reply( 200, { items: [], cursor: null } );
}

describe( 'FediverseAuthorProfilePanel — follow / unfollow button', () => {
	// `SocialFeedList` uses IntersectionObserver via
	// `react-intersection-observer`; jsdom doesn't provide it.
	beforeAll( () => {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof global.IntersectionObserver;
	} );

	afterAll( () => {
		// @ts-expect-error -- cleaning up the stub
		delete global.IntersectionObserver;
	} );

	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	// ---------------------------------------------------------------
	// jeherve flag #1: button hidden when viewer missing OR is_self true
	// ---------------------------------------------------------------

	it( 'hides the button when viewer is undefined (forwards-compat for pre-deploy backends)', async () => {
		stubProfile();
		stubFeed();

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		expect( screen.queryByRole( 'button', { name: /^Follow$/ } ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: /Unfollow/ } ) ).toBeNull();
	} );

	it( 'hides the button when is_self is true', async () => {
		stubProfile( {
			viewer: { following: false, followed_by: false, requested: false },
			is_self: true,
		} );
		stubFeed();

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		expect( screen.queryByRole( 'button', { name: /^Follow$/ } ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: /Unfollow/ } ) ).toBeNull();
	} );

	// ---------------------------------------------------------------
	// jeherve flag #2: follow / unfollow click → Tracks payload
	// (was_locked / was_requested captured at click time)
	// ---------------------------------------------------------------

	it( 'flows was_locked: true through to the follow_clicked Tracks payload for locked accounts', async () => {
		const user = userEvent.setup();
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		stubProfile( {
			locked: true,
			viewer: { following: false, followed_by: false, requested: false },
			is_self: false,
		} );
		stubFeed();
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/follows', { actor: ACTOR } )
			.reply( 200, { viewer: { following: false, followed_by: false, requested: true } } );

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );

		await waitFor( () =>
			expect( spy.mock.calls ).toContainEqual( [
				'calypso_reader_fediverse_profile_follow_clicked',
				{
					connection_id: 7,
					was_followed_by: false,
					was_locked: true,
				},
			] )
		);
	} );

	it( 'cancels a pending follow request and emits was_requested: true when clicking Cancel', async () => {
		const user = userEvent.setup();
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		stubProfile( {
			locked: true,
			viewer: { following: false, followed_by: false, requested: true },
			is_self: false,
		} );
		stubFeed();
		nock( BASE )
			.delete( `/wpcom/v2/reader/fediverse/connections/7/follows/${ encodeURIComponent( ACTOR ) }` )
			.reply( 200, { viewer: { following: false, followed_by: false, requested: false } } );

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click(
			await screen.findByRole( 'button', {
				name: /Cancel follow request to @alice@remote\.example/,
			} )
		);

		await waitFor( () =>
			expect( spy.mock.calls ).toContainEqual( [
				'calypso_reader_fediverse_profile_unfollow_clicked',
				{
					connection_id: 7,
					was_requested: true,
				},
			] )
		);
	} );

	// ---------------------------------------------------------------
	// jeherve flag #3: error path → Tracks error event +
	// errorNotice id + logstash type discriminator
	// ---------------------------------------------------------------

	it( 'fires _follow_error + scoped errorNotice + logstash on a 502 follow response', async () => {
		const user = userEvent.setup();
		const tracksSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const noticeSpy = jest.spyOn( notices, 'errorNotice' );
		stubProfile( {
			viewer: { following: false, followed_by: false, requested: false },
			is_self: false,
		} );
		stubFeed();
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/follows', { actor: ACTOR } )
			.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );

		await waitFor( () =>
			expect(
				tracksSpy.mock.calls.some(
					( [ event, props ] ) =>
						event === 'calypso_reader_fediverse_profile_follow_error' &&
						( props as Record< string, unknown > )?.action === 'follow' &&
						( props as Record< string, unknown > )?.error_kind === 'upstream_unavailable'
				)
			).toBe( true )
		);
		// Notice id is scoped to (connection.id, actor) so a sibling surface
		// (followers / following list) doesn't silently dismiss this toast.
		expect( noticeSpy ).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining( { id: `fediverse-follow-error-7-${ ACTOR }` } )
		);
		// Logstash type discriminator carries the action — `follow_mutation_error`,
		// not `unfollow_mutation_error` — so dashboards can split by direction.
		expect( logstash.logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feature: 'calypso_client',
				severity: 'error',
				extra: expect.objectContaining( {
					type: 'reader_fediverse_follow_mutation_error',
					connection_id: 7,
					error_kind: 'upstream_unavailable',
				} ),
			} )
		);
	} );

	// ---------------------------------------------------------------
	// jeherve flag #4: removeNotice on a successful retry
	// ---------------------------------------------------------------

	it( 'clears the stale follow-error toast on a successful retry', async () => {
		const user = userEvent.setup();
		const removeSpy = jest.spyOn( notices, 'removeNotice' );
		stubProfile( {
			viewer: { following: false, followed_by: false, requested: false },
			is_self: false,
		} );
		stubFeed();
		// First click 502s; second click succeeds. The success path should
		// `removeNotice` the same scoped id used by the error path so the
		// stale toast doesn't outlive the retry.
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/follows', { actor: ACTOR } )
			.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/follows', { actor: ACTOR } )
			.reply( 200, { viewer: { following: true, followed_by: false, requested: false } } );

		renderWithProvider( <FediverseAuthorProfilePanel connection={ connection } actor={ ACTOR } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );
		// Wait for the panel to settle back to the Follow button after the
		// optimistic patch rolls back, then click again.
		await screen.findByRole( 'button', { name: /^Follow$/ } );
		await user.click( screen.getByRole( 'button', { name: /^Follow$/ } ) );

		await waitFor( () =>
			expect( removeSpy ).toHaveBeenCalledWith( `fediverse-follow-error-7-${ ACTOR }` )
		);
	} );
} );
