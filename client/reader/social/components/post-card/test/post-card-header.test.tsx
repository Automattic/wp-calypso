/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardHeader } from '../post-card-header';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const base: AtmosphereFeedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	cid: 'c',
	author: { did: 'did:plc:abc', handle: 'alice.bsky.social', display_name: 'Alice', avatar: null },
	created_at: '2026-04-27T10:00:00Z',
	indexed_at: '2026-04-27T10:00:00Z',
	text: '',
	html: '',
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/x',
};

describe( 'PostCardHeader', () => {
	it( 'renders display name, handle, and a link to the author profile on bsky.app', () => {
		render( <PostCardHeader post={ base } variant="default" /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible();
		const authorLink = screen.getByRole( 'link', { name: /alice/i } );
		expect( authorLink ).toHaveAttribute( 'href', 'https://bsky.app/profile/alice.bsky.social' );
		expect( authorLink ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'falls back to handle when display_name is empty', () => {
		render(
			<PostCardHeader
				post={ { ...base, author: { ...base.author, display_name: '' } } }
				variant="default"
			/>
		);
		expect( screen.getAllByText( /alice\.bsky\.social/ ).length ).toBeGreaterThan( 0 );
	} );

	it( 'renders the repost reason when post.reason is present', () => {
		render(
			<PostCardHeader
				post={ {
					...base,
					reason: {
						type: 'repost',
						by: { did: 'did:plc:bob', handle: 'bob.bsky.social', display_name: 'Bob' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Reposted by Bob/ ) ).toBeVisible();
	} );

	it( 'renders the reply context when post.reply_parent is present', () => {
		render(
			<PostCardHeader
				post={ {
					...base,
					reply_parent: {
						uri: 'at://x',
						author: { did: 'did:plc:c', handle: 'carol.bsky.social' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Replying to @carol\.bsky\.social/ ) ).toBeVisible();
	} );
} );

function makeFeedItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		cid: 'cid-default',
		author: {
			did: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: '',
		html: '<p></p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		...overrides,
	};
}

function wrap(
	children: React.ReactNode,
	getThreadUrl?: ( uri: string ) => string | null,
	onClick = jest.fn()
) {
	return (
		<SocialAnalyticsProvider
			value={ {
				source: 'atmosphere',
				connectionId: 7,
				onClick,
				getThreadUrl,
			} }
		>
			{ children }
		</SocialAnalyticsProvider>
	);
}

describe( 'PostCardHeader getThreadUrl rewiring', () => {
	const post: AtmosphereFeedItem = makeFeedItem( {
		uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
		bluesky_url: 'https://bsky.app/profile/jane.bsky.social/post/3kabc',
		created_at: '2026-04-28T10:00:00Z',
		reply_parent: {
			uri: 'at://did:plc:def/app.bsky.feed.post/3kdef',
			author: { did: 'did:plc:def', handle: 'bob.bsky.social' },
		},
	} );

	it( 'links the timestamp to the in-app thread URL when getThreadUrl returns a string', () => {
		const getThreadUrl = ( uri: string ) =>
			uri === post.uri ? '/reader/atmosphere/7/thread/did:plc:abc/3kabc' : null;
		render( wrap( <PostCardHeader post={ post } variant="default" />, getThreadUrl ) );
		const inAppLinks = screen
			.getAllByRole( 'link' )
			.filter( ( a ) => a.getAttribute( 'href' )?.startsWith( '/reader/atmosphere/7/thread/' ) );
		expect( inAppLinks ).toHaveLength( 1 );
		expect( inAppLinks[ 0 ] ).not.toHaveAttribute( 'target' );
	} );

	it( 'falls back to bsky.app when getThreadUrl returns null', () => {
		render( wrap( <PostCardHeader post={ post } variant="default" />, () => null ) );
		const bskyLinks = screen
			.getAllByRole( 'link' )
			.filter( ( a ) => a.getAttribute( 'href' ) === post.bluesky_url );
		expect( bskyLinks.length ).toBeGreaterThanOrEqual( 1 );
		expect( bskyLinks[ 0 ] ).toHaveAttribute( 'target', '_blank' );
		expect( bskyLinks[ 0 ] ).toHaveAttribute( 'rel', expect.stringContaining( 'noopener' ) );
	} );

	it( 'reply-context preface becomes a link when getThreadUrl(reply_parent.uri) returns a string', () => {
		const getThreadUrl = ( uri: string ) =>
			uri === post.reply_parent!.uri ? '/reader/atmosphere/7/thread/did:plc:def/3kdef' : null;
		render( wrap( <PostCardHeader post={ post } variant="default" />, getThreadUrl ) );
		const link = screen.getByRole( 'link', { name: /Replying to @bob/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/7/thread/did:plc:def/3kdef' );
	} );

	it( 'reply-context preface stays static text when resolver returns null', () => {
		render( wrap( <PostCardHeader post={ post } variant="default" />, () => null ) );
		expect( screen.queryByRole( 'link', { name: /Replying to @bob/i } ) ).toBeNull();
		expect( screen.getByText( /Replying to @bob/i ) ).toBeVisible();
	} );

	it( 'fires reply-context Tracks event when the link is clicked', async () => {
		const onClick = jest.fn();
		const getThreadUrl = ( uri: string ) =>
			uri === post.reply_parent!.uri ? '/reader/atmosphere/7/thread/did:plc:def/3kdef' : null;
		render( wrap( <PostCardHeader post={ post } variant="default" />, getThreadUrl, onClick ) );
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'link', { name: /Replying to @bob/i } ) );
		expect( onClick ).toHaveBeenCalledWith(
			expect.stringContaining( '_reply_context_clicked' ),
			expect.objectContaining( {
				connection_id: 7,
				post_uri: post.uri,
				parent_uri: post.reply_parent!.uri,
			} )
		);
	} );
} );
