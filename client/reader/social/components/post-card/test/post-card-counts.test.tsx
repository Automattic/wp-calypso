/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeUseAtmosphereLikeAction } from 'calypso/reader/atmosphere/use-atmosphere-like-action';
import { makeUseAtmosphereRepostAction } from 'calypso/reader/atmosphere/use-atmosphere-repost-action';
import { makeUseMastodonLikeAction } from 'calypso/reader/mastodon/use-mastodon-like-action';
import { makeUseMastodonRepostAction } from 'calypso/reader/mastodon/use-mastodon-repost-action';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { LikeProvider } from '../like-context';
import { PostCardCounts } from '../post-card-counts';
import { RepostProvider } from '../repost-context';
import type { SocialPost } from '../../../types';

const post: SocialPost = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
	cid: 'bafy-cid',
	permalink: 'https://bsky.app/profile/alice.bsky.social/post/3kabc',
	author: {
		id: 'did:plc:abc',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
		profile_url: 'https://bsky.app/profile/alice.bsky.social',
	},
	created_at: '2026-04-27T10:00:00Z',
	indexed_at: '2026-04-27T10:00:00Z',
	text: 'hello',
	html: '<p>hello</p>',
	lang: [ 'en' ],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 5, reposts: 2, likes: 9, quotes: 1 },
	viewer: { like: null, repost: null },
};

function wrap(
	ui: React.ReactNode,
	getThreadUrl?: ( uri: string ) => string | null,
	onClick = jest.fn(),
	onReplyClick?: ( post: SocialPost ) => void
) {
	return (
		<SocialAnalyticsProvider
			value={ {
				source: 'atmosphere',
				connectionId: 7,
				onClick,
				getThreadUrl,
				onReplyClick,
			} }
		>
			{ ui }
		</SocialAnalyticsProvider>
	);
}

describe( 'PostCardCounts', () => {
	it( 'renders all three counts as static spans when no resolver is set', () => {
		render( wrap( <PostCardCounts post={ post } /> ) );
		expect( screen.queryByRole( 'link' ) ).toBeNull();
	} );

	it( 'renders the BlogAboutButton with an accessible label', () => {
		render( wrap( <PostCardCounts post={ post } /> ) );
		expect( screen.getByRole( 'button', { name: /Blog about this post/i } ) ).toBeVisible();
	} );

	it( 'renders the replies count as a link when getThreadUrl returns a string', () => {
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render( wrap( <PostCardCounts post={ post } />, getThreadUrl ) );
		const link = screen.getByRole( 'link', { name: /replies/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/7/thread/did:plc:abc/3kabc' );
		expect( link ).toHaveTextContent( '5' );
	} );

	it( 'fires _replies_count_clicked when the replies link is clicked', async () => {
		const onClick = jest.fn();
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render( wrap( <PostCardCounts post={ post } />, getThreadUrl, onClick ) );
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'link', { name: /replies/i } ) );
		expect( onClick ).toHaveBeenCalledWith(
			expect.stringContaining( '_replies_count_clicked' ),
			expect.objectContaining( {
				connection_id: 7,
				post_uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
				replies_count: 5,
				destination: 'in_app_thread',
			} )
		);
	} );

	it( 'reposts/likes stay non-interactive even when getThreadUrl is set', () => {
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render( wrap( <PostCardCounts post={ post } />, getThreadUrl ) );
		const links = screen.getAllByRole( 'link' );
		expect( links ).toHaveLength( 1 ); // only replies
	} );

	it( 'renders likes as a toggle button when a LikeProvider is mounted', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		renderWithProvider(
			<LikeProvider value={ useAtmosphereLikeAction }>
				{ wrap( <PostCardCounts post={ post } /> ) }
			</LikeProvider>
		);
		const button = screen.getByRole( 'button', { name: /like/i } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
		expect( button ).toHaveTextContent( '9' );
	} );

	it( 'renders replies count as a button that calls onReplyClick when bound', async () => {
		const onReplyClick = jest.fn();
		const onClick = jest.fn();
		const user = userEvent.setup();
		render( wrap( <PostCardCounts post={ post } />, undefined, onClick, onReplyClick ) );
		const button = screen.getByRole( 'button', { name: /^reply, 5 replies$/i } );
		expect( button ).toHaveTextContent( '5' );
		await user.click( button );
		expect( onReplyClick ).toHaveBeenCalledWith( post );
		expect( onClick ).toHaveBeenCalledWith(
			expect.stringContaining( '_replies_count_clicked' ),
			expect.objectContaining( {
				connection_id: 7,
				post_uri: post.uri,
				replies_count: 5,
				destination: 'composer',
			} )
		);
	} );

	it( 'renders the interactive reply button for posts without a cid (Mastodon shape)', async () => {
		// Mastodon `SocialPost` instances never carry a `cid` (it's an
		// AT-Proto strong-ref field). The reply gate must not require it,
		// otherwise the composer entry point silently disappears on
		// Mastodon — the very protocol that needs it.
		const cidlessPost: SocialPost = { ...post, cid: undefined };
		const onReplyClick = jest.fn();
		const user = userEvent.setup();
		render( wrap( <PostCardCounts post={ cidlessPost } />, undefined, jest.fn(), onReplyClick ) );
		const button = screen.getByRole( 'button', { name: /reply/i } );
		await user.click( button );
		expect( onReplyClick ).toHaveBeenCalledWith( cidlessPost );
	} );

	it( 'falls back to a link when onReplyClick is not bound', () => {
		const getThreadUrl = () => '/threads/x';
		render( wrap( <PostCardCounts post={ post } />, getThreadUrl ) );
		const link = screen.getByRole( 'link', { name: /replies/i } );
		expect( link ).toHaveAttribute( 'href', '/threads/x' );
	} );

	it( 'omits the zero-count clause from the reply accessible label when there are no replies', () => {
		const onReplyClick = jest.fn();
		const zeroRepliesPost = { ...post, counts: { ...post.counts, replies: 0 } };
		render(
			wrap( <PostCardCounts post={ zeroRepliesPost } />, undefined, jest.fn(), onReplyClick )
		);
		expect( screen.getByRole( 'button', { name: /^reply$/i } ) ).toBeVisible();
	} );

	it( 'renders reposts as a menu trigger when a RepostProvider is mounted', () => {
		renderWithProvider(
			<RepostProvider value={ makeUseAtmosphereRepostAction( 7 ) }>
				{ wrap( <PostCardCounts post={ post } /> ) }
			</RepostProvider>
		);
		const button = screen.getByRole( 'button', { name: /repost, 3 reposts/i } );
		expect( button ).toHaveAttribute( 'aria-haspopup', 'menu' );
		expect( button ).toHaveTextContent( '3' );
	} );

	it( 'renders reposts as a static span when no RepostProvider is mounted', () => {
		render( wrap( <PostCardCounts post={ post } /> ) );
		expect( screen.queryByRole( 'button', { name: /repost/i } ) ).toBeNull();
	} );

	it( 'does not render a quote button or quote count even when onQuoteClick is wired', () => {
		const onQuoteClick = jest.fn();
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ { source: 'atmosphere', connectionId: 42, onClick: jest.fn(), onQuoteClick } }
			>
				<PostCardCounts post={ post } />
			</SocialAnalyticsProvider>
		);
		expect( screen.queryByRole( 'button', { name: /quote/i } ) ).toBeNull();
	} );
} );

describe( 'PostCardCounts prominentTimestamp variant', () => {
	it( 'hides all three count digits when prominentTimestamp is true', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		const useAtmosphereRepostAction = makeUseAtmosphereRepostAction( 7 );
		renderWithProvider(
			<RepostProvider value={ useAtmosphereRepostAction }>
				<LikeProvider value={ useAtmosphereLikeAction }>
					{ wrap( <PostCardCounts post={ post } prominentTimestamp /> ) }
				</LikeProvider>
			</RepostProvider>
		);
		// aria-label still carries the count: 9 likes for the fixture
		const likeButton = screen.getByRole( 'button', { name: /like, 9 likes/i } );
		expect( likeButton ).not.toHaveTextContent( '9' );
		// repost button: 2 reposts + 1 quote = 3 in aria-label, hidden in text
		const repostButton = screen.getByRole( 'button', { name: /repost, 3 reposts/i } );
		expect( repostButton ).not.toHaveTextContent( '3' );
		// Replies digit (5 in the fixture) is also hidden — the only count
		// rendered directly by `<PostCardCounts>` rather than via a child button.
		expect( screen.queryByText( '5' ) ).toBeNull();
	} );

	it( 'renders a stats row above the action row with reposts, quotes, likes (atmosphere copy)', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		const useAtmosphereRepostAction = makeUseAtmosphereRepostAction( 7 );
		renderWithProvider(
			<RepostProvider value={ useAtmosphereRepostAction }>
				<LikeProvider value={ useAtmosphereLikeAction }>
					{ wrap( <PostCardCounts post={ post } prominentTimestamp /> ) }
				</LikeProvider>
			</RepostProvider>
		);
		const stats = screen.getByRole( 'list', { name: /post stats/i } );
		// fixture has reposts:2 quotes:1 likes:9
		expect( stats ).toHaveTextContent( '2 reposts' );
		expect( stats ).toHaveTextContent( '1 quote' );
		expect( stats ).toHaveTextContent( '9 likes' );
	} );

	it( 'hides individual zero-count stat items', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		const useAtmosphereRepostAction = makeUseAtmosphereRepostAction( 7 );
		const zeroQuotePost: SocialPost = {
			...post,
			counts: { replies: 5, reposts: 2, likes: 9, quotes: 0 },
		};
		renderWithProvider(
			<RepostProvider value={ useAtmosphereRepostAction }>
				<LikeProvider value={ useAtmosphereLikeAction }>
					{ wrap( <PostCardCounts post={ zeroQuotePost } prominentTimestamp /> ) }
				</LikeProvider>
			</RepostProvider>
		);
		const stats = screen.getByRole( 'list', { name: /post stats/i } );
		expect( stats ).toHaveTextContent( '2 reposts' );
		expect( stats ).not.toHaveTextContent( /quote/ );
		expect( stats ).toHaveTextContent( '9 likes' );
	} );

	it( 'omits the entire stats row when reposts + quotes + likes are all zero', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		const useAtmosphereRepostAction = makeUseAtmosphereRepostAction( 7 );
		const allZeroPost: SocialPost = {
			...post,
			counts: { replies: 5, reposts: 0, likes: 0, quotes: 0 },
		};
		renderWithProvider(
			<RepostProvider value={ useAtmosphereRepostAction }>
				<LikeProvider value={ useAtmosphereLikeAction }>
					{ wrap( <PostCardCounts post={ allZeroPost } prominentTimestamp /> ) }
				</LikeProvider>
			</RepostProvider>
		);
		expect( screen.queryByRole( 'list', { name: /post stats/i } ) ).toBeNull();
	} );

	it( 'uses Mastodon-flavoured copy in the stats row when the mastodon adapters are mounted', () => {
		renderWithProvider(
			<RepostProvider value={ makeUseMastodonRepostAction( 7 ) }>
				<LikeProvider value={ makeUseMastodonLikeAction( 7 ) }>
					<SocialAnalyticsProvider
						value={ { source: 'mastodon', connectionId: 7, onClick: jest.fn() } }
					>
						<PostCardCounts post={ post } prominentTimestamp />
					</SocialAnalyticsProvider>
				</LikeProvider>
			</RepostProvider>
		);
		const stats = screen.getByRole( 'list', { name: /post stats/i } );
		expect( stats ).toHaveTextContent( '2 boosts' );
		expect( stats ).toHaveTextContent( '1 quote' );
		expect( stats ).toHaveTextContent( '9 favorites' );
	} );

	it( 'does not render a stats row when prominentTimestamp is false', () => {
		const useAtmosphereLikeAction = makeUseAtmosphereLikeAction( 7 );
		const useAtmosphereRepostAction = makeUseAtmosphereRepostAction( 7 );
		renderWithProvider(
			<RepostProvider value={ useAtmosphereRepostAction }>
				<LikeProvider value={ useAtmosphereLikeAction }>
					{ wrap( <PostCardCounts post={ post } /> ) }
				</LikeProvider>
			</RepostProvider>
		);
		expect( screen.queryByRole( 'list', { name: /post stats/i } ) ).toBeNull();
	} );
} );
