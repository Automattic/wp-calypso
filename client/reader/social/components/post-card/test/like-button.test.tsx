/**
 * @jest-environment jsdom
 */
import { PENDING_LIKE_URI } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as notices from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { LikeButton } from '../like-button';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const POST_URI = 'at://did:plc:author/app.bsky.feed.post/3kabc';
const POST_CID = 'bafy-cid';
const LIKE_URI = 'at://did:plc:caller/app.bsky.feed.like/3krkeyrkeyrke';

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
		counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
		viewer: { like: null, repost: null },
		bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/3kabc',
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
}

function renderLikeButton(
	post = makePost(),
	{ onClick = jest.fn() }: { onClick?: jest.Mock } = {}
) {
	return {
		onClick,
		...renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick,
				} }
			>
				<LikeButton post={ post } connectionId={ 42 } />
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		),
	};
}

describe( '<LikeButton>', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders outlined heart and count when not liked', () => {
		renderLikeButton();
		const button = screen.getByRole( 'button', { name: /like, 5 likes/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
		expect( button ).toHaveTextContent( '5' );
	} );

	it( 'keeps a stable label and sets aria-pressed=true when already liked', () => {
		renderLikeButton( makePost( { viewer: { like: LIKE_URI, repost: null } } ) );
		const button = screen.getByRole( 'button', { name: /like, 5 likes/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'click in unliked state fires POST and Tracks event', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/likes', {
				post_uri: POST_URI,
				post_cid: POST_CID,
			} )
			.reply( 200, {
				like: { uri: LIKE_URI, cid: 'bafy-like-cid', rkey: '3krkeyrkeyrke' },
			} );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton();
		await user.click( screen.getByRole( 'button', { name: /like, 5 likes/i } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_like_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'click in liked state fires DELETE with the rkey from viewer.like', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
			.reply( 204 );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton(
			makePost( { viewer: { like: LIKE_URI, repost: null } } )
		);
		await user.click( screen.getByRole( 'button', { name: /like, 5 likes/i } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_unlike_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: POST_URI } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'disables the button while the pending sentinel is set', async () => {
		const interceptor = nock( BASE )
			.delete( /\/likes\// )
			.reply( 204 );

		const user = userEvent.setup();
		renderLikeButton( makePost( { viewer: { like: PENDING_LIKE_URI, repost: null } } ) );
		const button = screen.getByRole( 'button', { name: /like, 5 likes/i } );
		expect( button ).toBeDisabled();
		await user.click( button );

		expect( interceptor.isDone() ).toBe( false );
	} );

	it( 'treats viewer:undefined as not-liked and POSTs on click', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/likes', {
				post_uri: POST_URI,
				post_cid: POST_CID,
			} )
			.reply( 200, {
				like: { uri: LIKE_URI, cid: 'bafy-like-cid', rkey: '3krkeyrkeyrke' },
			} );

		const user = userEvent.setup();
		const post = makePost();
		delete ( post as Partial< AtmosphereFeedItem > ).viewer;
		renderLikeButton( post );
		const button = screen.getByRole( 'button', { name: /like, 5 likes/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );

		await user.click( button );
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'create-like error dispatches errorNotice + Tracks error event', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/likes' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton();
		await user.click( screen.getByRole( 'button', { name: /like, 5 likes/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_like_error_shown',
				expect.objectContaining( { error_kind: 'upstream_unavailable', direction: 'like' } )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith( 'Could not save your like. Please try again.' );
	} );

	it( 'delete-like error dispatches errorNotice + Tracks unlike-error event', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
			.reply( 401, { error: 'atmosphere_unauthenticated' } );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton(
			makePost( { viewer: { like: LIKE_URI, repost: null } } )
		);
		await user.click( screen.getByRole( 'button', { name: /like, 5 likes/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_like_error_shown',
				expect.objectContaining( { error_kind: 'auth_required', direction: 'unlike' } )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith(
			'Reconnect your Bluesky account to like posts.'
		);
	} );

	it( 'click does not bubble to parent listener', async () => {
		const onParentClick = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick: jest.fn(),
				} }
			>
				<div role="button" tabIndex={ 0 } onClick={ onParentClick } onKeyDown={ onParentClick }>
					<LikeButton
						post={ makePost( { viewer: { like: PENDING_LIKE_URI, repost: null } } ) }
						connectionId={ 42 }
					/>
				</div>
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		);

		await user.click( screen.getByRole( 'button', { name: /like, 5 likes/i } ) );
		expect( onParentClick ).not.toHaveBeenCalled();
	} );
} );
