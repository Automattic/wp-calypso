/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as notices from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../../social/components/post-card/analytics-context';
import { LikeButton } from '../../social/components/post-card/like-button';
import { LikeProvider } from '../../social/components/post-card/like-context';
import { makeUseMastodonLikeAction } from '../use-mastodon-like-action';
import type { SocialPost } from '../../social/types';

// `logToLogstash` fires a real HTTPS request — mute it so the
// pipeline-level error log in the Mastodon mutations doesn't trigger
// an unmocked nock request during the error-path tests.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const BASE = 'https://public-api.wordpress.com';
const STATUS_ID = '109876543210';
const CONNECTION_ID = 99;

function makePost( overrides: Partial< SocialPost > = {} ): SocialPost {
	return {
		uri: STATUS_ID,
		cid: undefined,
		permalink: `https://mastodon.social/@alice/${ STATUS_ID }`,
		author: {
			id: '12345',
			handle: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			profile_url: 'https://mastodon.social/@alice',
		},
		created_at: '2026-04-30T12:00:00Z',
		indexed_at: '2026-04-30T12:00:00Z',
		text: 'hello mastodon',
		html: '<p>hello mastodon</p>',
		lang: [ 'en' ],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 7, quotes: 0 },
		viewer: { like: null, repost: null },
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
	const useMastodonLikeAction = makeUseMastodonLikeAction( CONNECTION_ID );
	return {
		onClick,
		...renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'mastodon',
					connectionId: CONNECTION_ID,
					onClick,
				} }
			>
				<LikeProvider value={ useMastodonLikeAction }>
					<LikeButton post={ post } />
				</LikeProvider>
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		),
	};
}

describe( 'makeUseMastodonLikeAction', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'isLiked is false when viewer.like is null', () => {
		renderLikeButton( makePost( { viewer: { like: null, repost: null } } ) );
		const button = screen.getByRole( 'button', { name: /favorite, 7 favorites/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
	} );

	it( 'isLiked is true when viewer.like is truthy', () => {
		renderLikeButton( makePost( { viewer: { like: 'favorited', repost: null } } ) );
		const button = screen.getByRole( 'button', { name: /favorite, 7 favorites/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'renders label "Favorite" and accessible label with formatted count', () => {
		renderLikeButton();
		// The button text is the count; the aria-label contains the accessible label.
		const button = screen.getByRole( 'button', { name: /favorite, 7 favorites/i } );
		expect( button ).toBeVisible();
		expect( button ).toHaveTextContent( '7' );
	} );

	it( 'omits the zero-count clause from the accessible label when there are no favorites', () => {
		renderLikeButton( makePost( { counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 } } ) );
		expect( screen.getByRole( 'button', { name: /^favorite$/i } ) ).toBeVisible();
	} );

	it( 'like() POSTs to the likes endpoint and fires _favorite_clicked Tracks', async () => {
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
				status_id: STATUS_ID,
			} )
			.reply( 200 );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton();
		await user.click( screen.getByRole( 'button', { name: /favorite, 7 favorites/i } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_favorite_clicked',
			expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: STATUS_ID } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'unlike() DELETEs from the likes endpoint and fires _unfavorite_clicked Tracks', async () => {
		nock( BASE )
			.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ STATUS_ID }` )
			.reply( 200 );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton(
			makePost( { viewer: { like: 'favorited', repost: null } } )
		);
		await user.click( screen.getByRole( 'button', { name: /favorite, 7 favorites/i } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_unfavorite_clicked',
			expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: STATUS_ID } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'on like() error fires _favorite_error_shown Tracks with error_kind and direction', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
				status_id: STATUS_ID,
			} )
			.reply( 502, { error: 'upstream_unavailable' } );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton();
		await user.click( screen.getByRole( 'button', { name: /favorite, 7 favorites/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_favorite_error_shown',
				expect.objectContaining( {
					error_kind: 'upstream_unavailable',
					direction: 'favorite',
				} )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith(
			'Could not save your favorite. Please try again.'
		);
	} );

	it( 'on unlike() auth error fires _favorite_error_shown Tracks with auth error copy', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ STATUS_ID }` )
			.reply( 401, { error: 'not_authenticated' } );

		const user = userEvent.setup();
		const { onClick } = renderLikeButton(
			makePost( { viewer: { like: 'favorited', repost: null } } )
		);
		await user.click( screen.getByRole( 'button', { name: /favorite, 7 favorites/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_favorite_error_shown',
				expect.objectContaining( {
					error_kind: 'auth_required',
					direction: 'unfavorite',
				} )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith(
			'Reconnect your Mastodon account to favorite posts.'
		);
	} );

	it( 'isLiked is false when viewer is absent', () => {
		const post = makePost();
		delete ( post as Partial< SocialPost > ).viewer;
		renderLikeButton( post );
		const button = screen.getByRole( 'button', { name: /favorite, 7 favorites/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
	} );
} );
