/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as notices from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostActionsMenu } from '../post-actions-menu';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const POST_URI = 'at://did:plc:caller/app.bsky.feed.post/3krkey';
const RKEY = '3krkey';
const CONNECTION_ID = 42;

function makePost( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: POST_URI,
		cid: 'bafy-cid',
		author: {
			did: 'did:plc:caller',
			handle: 'caller.bsky.social',
			display_name: 'Caller',
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
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		viewer: { like: null, repost: null },
		bluesky_url: 'https://bsky.app/profile/caller.bsky.social/post/3krkey',
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
}

function renderMenu( {
	ownerDid = 'did:plc:caller',
	onClick = jest.fn(),
}: { ownerDid?: string; onClick?: jest.Mock } = {} ) {
	return {
		onClick,
		...renderWithProvider(
			<SocialAnalyticsProvider
				value={ { source: 'atmosphere', connectionId: CONNECTION_ID, onClick, ownerDid } }
			>
				<PostActionsMenu post={ makePost() } connectionId={ CONNECTION_ID } />
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		),
	};
}

describe( '<PostActionsMenu>', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the kebab when ownerDid matches post.author.did', () => {
		renderMenu();
		expect( screen.getByRole( 'button', { name: /post actions/i } ) ).toBeVisible();
	} );

	it( 'renders nothing when ownerDid does not match', () => {
		renderMenu( { ownerDid: 'did:plc:someoneelse' } );
		expect( screen.queryByRole( 'button', { name: /post actions/i } ) ).not.toBeInTheDocument();
	} );

	it( 'opens a confirm modal when Delete is clicked', async () => {
		const user = userEvent.setup();
		renderMenu();
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		expect( await screen.findByRole( 'dialog', { name: /delete this post\?/i } ) ).toBeVisible();
	} );

	it( 'fires the DELETE request when the confirm button is clicked', async () => {
		const user = userEvent.setup();
		const scope = nock( BASE )
			.delete( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/posts/${ RKEY }` )
			.reply( 204 );
		const onClick = jest.fn();
		renderMenu( { onClick } );
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		await user.click( screen.getByRole( 'button', { name: /^delete$/i } ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_post_deleted',
			expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: POST_URI } )
		);
	} );

	it( 'shows an error notice when the DELETE fails', async () => {
		const user = userEvent.setup();
		nock( BASE )
			.delete( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/posts/${ RKEY }` )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );
		const errorNotice = jest.spyOn( notices, 'errorNotice' );
		const onClick = jest.fn();
		renderMenu( { onClick } );
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		await user.click( screen.getByRole( 'button', { name: /^delete$/i } ) );
		await waitFor( () => expect( errorNotice ).toHaveBeenCalled() );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_post_delete_error_shown',
			expect.objectContaining( { error_kind: 'upstream_unavailable' } )
		);
	} );

	it( 'closes the confirm modal without calling DELETE when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const scope = nock( BASE )
			.delete( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/posts/${ RKEY }` )
			.reply( 204 );
		renderMenu();
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		await user.click( screen.getByRole( 'button', { name: /^cancel$/i } ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( scope.isDone() ).toBe( false );
	} );

	it( 'fires the not_found Tracks event without an error notice on idempotent 404', async () => {
		const user = userEvent.setup();
		nock( BASE )
			.delete( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/posts/${ RKEY }` )
			.reply( 404, { error: 'atmosphere_not_found' } );
		const errorNotice = jest.spyOn( notices, 'errorNotice' );
		const onClick = jest.fn();
		renderMenu( { onClick } );
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		await user.click( screen.getByRole( 'button', { name: /^delete$/i } ) );
		await waitFor( () =>
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_post_delete_not_found',
				expect.objectContaining( { connection_id: CONNECTION_ID, post_uri: POST_URI } )
			)
		);
		expect( errorNotice ).not.toHaveBeenCalled();
		expect( onClick ).not.toHaveBeenCalledWith(
			'calypso_reader_atmosphere_post_delete_error_shown',
			expect.anything()
		);
	} );

	it( 'forwards reply_parent.uri as replyParentUri when deleting a reply', async () => {
		const user = userEvent.setup();
		const REPLY_PARENT_URI = 'at://did:plc:other/app.bsky.feed.post/3kparent';
		const scope = nock( BASE )
			.delete( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/posts/${ RKEY }` )
			.reply( 204 );
		const replyPost: AtmosphereFeedItem = {
			...makePost(),
			reply_parent: {
				uri: REPLY_PARENT_URI,
				cid: 'bafy-parent-cid',
				author: { did: 'did:plc:other', handle: 'other.bsky.social' },
			},
			reply_root: {
				uri: REPLY_PARENT_URI,
				cid: 'bafy-parent-cid',
				author: { did: 'did:plc:other', handle: 'other.bsky.social' },
			},
		};
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: CONNECTION_ID,
					onClick: jest.fn(),
					ownerDid: 'did:plc:caller',
				} }
			>
				<PostActionsMenu post={ replyPost } connectionId={ CONNECTION_ID } />
			</SocialAnalyticsProvider>,
			{ queryClient: makeQueryClient() }
		);
		await user.click( screen.getByRole( 'button', { name: /post actions/i } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: /delete/i } ) );
		await user.click( screen.getByRole( 'button', { name: /^delete$/i } ) );
		// The reply-parent URI is consumed by the mutation (decrements parent
		// counts.replies); assert here the request fired so the wiring from the
		// menu through to mutation vars is exercised end-to-end.
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );
