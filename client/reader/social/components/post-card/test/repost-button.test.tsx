/**
 * @jest-environment jsdom
 */
// `logToLogstash` fires a real HTTPS request — mute it so the
// rkey-missing/cid-missing observability paths in the atmosphere
// repost adapter don't trigger unmocked nock requests.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import { PENDING_REPOST_URI } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { makeUseAtmosphereRepostAction } from 'calypso/reader/atmosphere/use-atmosphere-repost-action';
import { mapAtmosphereFeedItemToSocialPost } from 'calypso/reader/social';
import * as notices from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { RepostButton } from '../repost-button';
import { RepostProvider } from '../repost-context';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const POST_URI = 'at://did:plc:author/app.bsky.feed.post/3kabc';
const POST_CID = 'bafy-cid';
const REPOST_URI = 'at://did:plc:caller/app.bsky.feed.repost/3krkeyrkeyrke';

function makePost( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: POST_URI,
		cid: POST_CID,
		author: {
			did: 'did:plc:author',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: null,
		},
		created_at: '2026-04-30T12:00:00Z',
		indexed_at: '2026-04-30T12:00:00Z',
		text: 'hi',
		html: '<p>hi</p>',
		lang: [ 'en' ],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 4, likes: 0, quotes: 0 },
		viewer: { like: null, repost: null },
		bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/3kabc',
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
}

function renderRepostButton(
	post = makePost(),
	{
		onClick = jest.fn(),
		onQuoteClick,
		hideCount,
	}: { onClick?: jest.Mock; onQuoteClick?: jest.Mock; hideCount?: boolean } = {}
) {
	const useRepostAction = makeUseAtmosphereRepostAction( 42 );
	const socialPost = mapAtmosphereFeedItemToSocialPost( post );
	return {
		onClick,
		onQuoteClick,
		...renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick,
					onQuoteClick,
				} }
			>
				<RepostProvider value={ useRepostAction }>
					<RepostButton post={ socialPost } hideCount={ hideCount } />
				</RepostProvider>
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		),
	};
}

describe( '<RepostButton>', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'omits the visible count when hideCount is true but keeps the aria-label count', () => {
		renderRepostButton( makePost(), { hideCount: true } );
		const button = screen.getByRole( 'button', { name: /repost, 4 reposts/i } );
		expect( button ).not.toHaveTextContent( '4' );
	} );

	it( 'renders a menu trigger when not reposted', () => {
		renderRepostButton();
		const button = screen.getByRole( 'button', { name: /repost, 4 reposts/i } );
		expect( button ).toHaveAttribute( 'aria-haspopup', 'menu' );
		expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( button ).toHaveTextContent( '4' );
	} );

	it( 'renders an aria-pressed toggle when already reposted', () => {
		renderRepostButton( makePost( { viewer: { like: null, repost: REPOST_URI } } ) );
		const button = screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'click in not-reposted state opens the menu with Repost enabled and Quote post disabled', async () => {
		const user = userEvent.setup();
		renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );

		const repostItem = await screen.findByRole( 'menuitem', { name: 'Repost' } );
		const quoteItem = screen.getByRole( 'menuitem', { name: 'Quote post' } );
		expect( repostItem ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( quoteItem ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'clicking the Repost menu item fires POST and the repost_clicked Tracks event', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts', {
				post_uri: POST_URI,
				post_cid: POST_CID,
			} )
			.reply( 200, {
				repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krkeyrkeyrke' },
			} );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Repost' } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_repost_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'clicking Quote post does not fire any mutation or Tracks event', async () => {
		const user = userEvent.setup();
		const { onClick } = renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		const quoteItem = await screen.findByRole( 'menuitem', { name: 'Quote post' } );
		await user.click( quoteItem );

		expect( onClick ).not.toHaveBeenCalled();
	} );

	it( 'click in reposted state fires DELETE without opening a menu', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
			.reply( 204 );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton(
			makePost( { viewer: { like: null, repost: REPOST_URI } } )
		);
		await user.click( screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } ) );

		expect( screen.queryByRole( 'menuitem', { name: 'Repost' } ) ).toBeNull();
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_unrepost_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'does not fire DELETE when the reposted-state URI parses to no rkey, and surfaces the failure', async () => {
		const interceptor = nock( BASE )
			.delete( /\/reposts\// )
			.reply( 204 );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton(
			// Malformed at-uri: starts with `at://` but missing the rkey segment
			// after the collection. `rkeyFromUri()` returns null for this shape,
			// which gates the DELETE in `unrepost`.
			makePost( { viewer: { like: null, repost: 'at://did:plc:caller/app.bsky.feed.repost' } } )
		);
		await user.click( screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } ) );

		expect( interceptor.isDone() ).toBe( false );
		// The button used to silently no-op here; it now fires an
		// observability Tracks event so dashboards see the rate of stuck
		// pending vs. malformed-uri unrepost attempts.
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_unrepost_rkey_missing',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
	} );

	it( 'sums reposts + quotes in the visible count and the aria-label', () => {
		renderRepostButton( makePost( { counts: { replies: 0, reposts: 4, likes: 0, quotes: 3 } } ) );
		const button = screen.getByRole( 'button', { name: /repost, 7 reposts/i } );
		expect( button ).toHaveTextContent( '7' );
	} );

	it( 'static render branch (no RepostProvider) shows the summed count', () => {
		const socialPost = mapAtmosphereFeedItemToSocialPost(
			makePost( { counts: { replies: 0, reposts: 4, likes: 0, quotes: 3 } } )
		);
		// Render without `<RepostProvider>` so `action.supported === false` and
		// the static fallback `<span class="...--static">` branch renders.
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ { source: 'atmosphere', connectionId: 42, onClick: jest.fn() } }
			>
				<RepostButton post={ socialPost } />
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		);
		// Static fallback renders a <span>, not a button — no role: button query.
		expect( screen.queryByRole( 'button' ) ).toBeNull();
		expect( screen.getByText( '7' ) ).toBeVisible();
	} );

	it( 'renders the singular aria-label when reposts === 1', () => {
		renderRepostButton( makePost( { counts: { replies: 0, reposts: 1, likes: 0, quotes: 0 } } ) );
		expect( screen.getByRole( 'button', { name: /^repost, 1 repost$/i } ) ).toBeVisible();
	} );

	it( 'omits the zero-count clause when there are no reposts', () => {
		renderRepostButton( makePost( { counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 } } ) );
		expect( screen.getByRole( 'button', { name: /^repost$/i } ) ).toBeVisible();
	} );

	it( 'omits the zero-count clause from the "Undo repost" label when the viewer has reposted but the count is zero', () => {
		renderRepostButton(
			makePost( {
				counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
				viewer: { like: null, repost: REPOST_URI },
			} )
		);
		expect( screen.getByRole( 'button', { name: /^undo repost$/i } ) ).toBeVisible();
	} );

	it( 'shows a rate-limit notice on rate_limited create errors', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );

		const user = userEvent.setup();
		renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Repost' } ) );

		await waitFor( () =>
			expect( errorNoticeSpy ).toHaveBeenCalledWith(
				"You're reposting too quickly. Try again in a moment."
			)
		);
	} );

	it( 'shows a connection-missing notice on connection_not_found errors', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
			.reply( 404, { error: 'connection_not_found' } );

		const user = userEvent.setup();
		renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Repost' } ) );

		await waitFor( () =>
			expect( errorNoticeSpy ).toHaveBeenCalledWith( 'This connection no longer exists.' )
		);
	} );

	it( 'disables the button while the pending sentinel is set', async () => {
		const interceptor = nock( BASE )
			.delete( /\/reposts\// )
			.reply( 204 );

		const user = userEvent.setup();
		renderRepostButton( makePost( { viewer: { like: null, repost: PENDING_REPOST_URI } } ) );
		const button = screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.click( button );

		expect( interceptor.isDone() ).toBe( false );
	} );

	it( 'treats viewer:undefined as not-reposted and opens the menu on click', async () => {
		const user = userEvent.setup();
		const post = makePost();
		delete ( post as Partial< AtmosphereFeedItem > ).viewer;
		renderRepostButton( post );
		const button = screen.getByRole( 'button', { name: /repost, 4 reposts/i } );
		expect( button ).toHaveAttribute( 'aria-haspopup', 'menu' );

		await user.click( button );
		expect( await screen.findByRole( 'menuitem', { name: 'Repost' } ) ).toBeEnabled();
	} );

	it( 'create-repost error dispatches errorNotice + Tracks error event', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Repost' } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_repost_error_shown',
				expect.objectContaining( { error_kind: 'upstream_unavailable', direction: 'repost' } )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith(
			'Could not save your repost. Please try again.'
		);
	} );

	it( 'delete-repost error dispatches errorNotice + Tracks unrepost-error event', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
			.reply( 401, { error: 'atmosphere_unauthenticated' } );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton(
			makePost( { viewer: { like: null, repost: REPOST_URI } } )
		);
		await user.click( screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_repost_error_shown',
				expect.objectContaining( { error_kind: 'auth_required', direction: 'unrepost' } )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith( 'Reconnect your Bluesky account to repost.' );
	} );

	it( 'leaves "Quote post" disabled when no onQuoteClick is wired in the analytics context', async () => {
		const user = userEvent.setup();
		renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		const item = await screen.findByRole( 'menuitem', { name: /quote post/i } );
		expect( item ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'leaves "Quote post" disabled when the post is missing a cid', async () => {
		const onQuoteClick = jest.fn();
		const user = userEvent.setup();
		const { onClick } = renderRepostButton( makePost( { cid: '' } ), { onQuoteClick } );
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		const item = await screen.findByRole( 'menuitem', { name: /quote post/i } );
		expect( item ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.click( item );
		expect( onQuoteClick ).not.toHaveBeenCalled();
		expect( onClick ).not.toHaveBeenCalledWith(
			'calypso_reader_atmosphere_quote_clicked',
			expect.anything()
		);
	} );

	it( 'enables "Quote post" and invokes onQuoteClick when the analytics context wires it', async () => {
		const onQuoteClick = jest.fn();
		const user = userEvent.setup();
		const { onClick } = renderRepostButton( makePost(), { onQuoteClick } );
		await user.click( screen.getByRole( 'button', { name: /repost, 4 reposts/i } ) );
		const item = await screen.findByRole( 'menuitem', { name: 'Quote post' } );
		expect( item ).not.toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( item );
		expect( onQuoteClick ).toHaveBeenCalledTimes( 1 );
		expect( onQuoteClick.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( { uri: POST_URI, cid: POST_CID } )
		);
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_quote_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
	} );

	it( 'click does not bubble to a parent listener', async () => {
		const onParentClick = jest.fn();
		const user = userEvent.setup();
		const useRepostAction = makeUseAtmosphereRepostAction( 42 );
		const socialPost = mapAtmosphereFeedItemToSocialPost(
			makePost( { viewer: { like: null, repost: PENDING_REPOST_URI } } )
		);
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ { source: 'atmosphere', connectionId: 42, onClick: jest.fn() } }
			>
				<RepostProvider value={ useRepostAction }>
					<div role="button" tabIndex={ 0 } onClick={ onParentClick } onKeyDown={ onParentClick }>
						<RepostButton post={ socialPost } />
					</div>
				</RepostProvider>
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		);

		await user.click( screen.getByRole( 'button', { name: /undo repost, 4 reposts/i } ) );
		expect( onParentClick ).not.toHaveBeenCalled();
	} );
} );
