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
import { RepostButton } from '../../social/components/post-card/repost-button';
import { RepostProvider } from '../../social/components/post-card/repost-context';
import { makeUseMastodonRepostAction } from '../use-mastodon-repost-action';
import type { SocialPost } from '../../social/types';

// `logToLogstash` fires a real HTTPS request — mute it so the
// pipeline-level error log in the repost adapter doesn't trigger an
// unmocked nock request during error-path tests.
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
		counts: { replies: 0, reposts: 5, likes: 7, quotes: 0 },
		viewer: { like: null, repost: null },
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
}

function renderRepostButton(
	post = makePost(),
	{ onClick = jest.fn() }: { onClick?: jest.Mock } = {}
) {
	const useMastodonRepostAction = makeUseMastodonRepostAction( CONNECTION_ID );
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
				<RepostProvider value={ useMastodonRepostAction }>
					<RepostButton post={ post } />
				</RepostProvider>
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		),
	};
}

describe( 'makeUseMastodonRepostAction', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'isReposted is false when viewer.repost is null', () => {
		renderRepostButton( makePost( { viewer: { like: null, repost: null } } ) );
		// Not boosted: renders as a dropdown toggle (aria-haspopup="menu"),
		// not a plain aria-pressed button.
		const button = screen.getByRole( 'button', { name: /boost, 5 boosts/i } );
		expect( button ).toHaveAttribute( 'aria-haspopup', 'menu' );
		expect( button ).not.toHaveAttribute( 'aria-pressed' );
	} );

	it( 'isReposted is true when viewer.repost is truthy', () => {
		renderRepostButton( makePost( { viewer: { like: null, repost: 'reblogged' } } ) );
		// Boosted: renders as a plain button with aria-pressed="true"
		const button = screen.getByRole( 'button', { name: /undo boost, 5 boosts/i } );
		expect( button ).toHaveAttribute( 'aria-pressed' );
	} );

	it( 'renders label "Boost" and accessible label with formatted count', async () => {
		const user = userEvent.setup();
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
				status_id: STATUS_ID,
			} )
			.reply( 200 );

		renderRepostButton();
		const button = screen.getByRole( 'button', { name: /boost, 5 boosts/i } );
		expect( button ).toBeVisible();
		expect( button ).toHaveTextContent( '5' );

		// Open dropdown to see the "Boost" menu item label. The dropdown
		// renders into a Popover portal — jsdom doesn't compute the
		// portal's CSS visibility reliably across runs, so assert presence
		// in the DOM instead of `toBeVisible`.
		await user.click( button );
		expect( await screen.findByRole( 'menuitem', { name: 'Boost' } ) ).toBeInTheDocument();
	} );

	it( 'repost() POSTs to the reposts endpoint and fires _boost_clicked Tracks', async () => {
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
				status_id: STATUS_ID,
			} )
			.reply( 200 );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton();
		// Click dropdown toggle
		await user.click( screen.getByRole( 'button', { name: /boost, 5 boosts/i } ) );
		// Click "Boost" menu item
		await user.click( screen.getByRole( 'menuitem', { name: 'Boost' } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_boost_clicked',
			expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: STATUS_ID } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'unrepost() DELETEs from the reposts endpoint and fires _unboost_clicked Tracks', async () => {
		nock( BASE )
			.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ STATUS_ID }` )
			.reply( 200 );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton(
			makePost( { viewer: { like: null, repost: 'reblogged' } } )
		);
		await user.click( screen.getByRole( 'button', { name: /undo boost, 5 boosts/i } ) );

		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_unboost_clicked',
			expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: STATUS_ID } )
		);
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'on repost() error fires _boost_error_shown Tracks with error_kind and direction', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
				status_id: STATUS_ID,
			} )
			.reply( 502, { error: 'upstream_unavailable' } );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton();
		await user.click( screen.getByRole( 'button', { name: /boost, 5 boosts/i } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Boost' } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_boost_error_shown',
				expect.objectContaining( {
					error_kind: 'upstream_unavailable',
					direction: 'boost',
				} )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith( 'Could not save your boost. Please try again.' );
	} );

	it( 'on unrepost() auth error fires _boost_error_shown Tracks with direction: unboost', async () => {
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );
		nock( BASE )
			.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ STATUS_ID }` )
			.reply( 401, { error: 'not_authenticated' } );

		const user = userEvent.setup();
		const { onClick } = renderRepostButton(
			makePost( { viewer: { like: null, repost: 'reblogged' } } )
		);
		await user.click( screen.getByRole( 'button', { name: /undo boost, 5 boosts/i } ) );

		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_boost_error_shown',
				expect.objectContaining( {
					error_kind: 'auth_required',
					direction: 'unboost',
				} )
			)
		);
		expect( errorNoticeSpy ).toHaveBeenCalledWith(
			'Reconnect your Mastodon account to boost posts.'
		);
	} );

	it( 'isReposted is false when viewer is absent', () => {
		const post = makePost();
		delete ( post as Partial< SocialPost > ).viewer;
		renderRepostButton( post );
		const button = screen.getByRole( 'button', { name: /boost, 5 boosts/i } );
		expect( button ).toBeVisible();
	} );
} );
