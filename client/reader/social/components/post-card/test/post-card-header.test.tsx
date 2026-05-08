/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardHeader } from '../post-card-header';
import type { SocialPost } from '../../../types';

const base: SocialPost = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	author: {
		id: 'did:plc:abc',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
		profile_url: 'https://bsky.app/profile/alice.bsky.social',
	},
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
	permalink: 'https://bsky.app/profile/alice.bsky.social/post/x',
};

describe( 'PostCardHeader compact + timestampLink', () => {
	it( 'renders the timestamp as an anchor when timestampLink is provided', () => {
		const onClick = jest.fn();
		render(
			<PostCardHeader
				post={ base }
				variant="compact"
				timestampLink={ {
					href: '/reader/atmosphere/7/thread/x/y',
					onClick,
				} }
			/>
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/7/thread/x/y' );
		expect( link ).toHaveClass( 'social-post-card-header__timestamp' );
	} );

	it( 'fires the supplied onClick when the timestamp is clicked', async () => {
		const onClick = jest.fn();
		render(
			<PostCardHeader
				post={ base }
				variant="compact"
				timestampLink={ {
					href: '/reader/atmosphere/7/thread/x/y',
					onClick,
				} }
			/>
		);
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'link' ) );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders plain TimeSince in compact mode when timestampLink is omitted', () => {
		render( <PostCardHeader post={ base } variant="compact" /> );
		expect( screen.queryByRole( 'link' ) ).toBeNull();
	} );
} );

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
						by: { id: 'did:plc:bob', handle: 'bob.bsky.social', display_name: 'Bob' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Reposted by/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Bob' } ) ).toBeVisible();
	} );

	it( 'renders the reply context when post.reply_parent is present', () => {
		render(
			<PostCardHeader
				post={ {
					...base,
					reply_parent: {
						uri: 'at://x',
						author: { id: 'did:plc:c', handle: 'carol.bsky.social' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Replying to @carol\.bsky\.social/ ) ).toBeVisible();
	} );
} );

function makeSocialPost( overrides: Partial< SocialPost > = {} ): SocialPost {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		permalink: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		author: {
			id: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
			profile_url: 'https://bsky.app/profile/default.bsky.social',
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
	const post: SocialPost = makeSocialPost( {
		uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
		permalink: 'https://bsky.app/profile/jane.bsky.social/post/3kabc',
		created_at: '2026-04-28T10:00:00Z',
		reply_parent: {
			uri: 'at://did:plc:def/app.bsky.feed.post/3kdef',
			author: { id: 'did:plc:def', handle: 'bob.bsky.social' },
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
			.filter( ( a ) => a.getAttribute( 'href' ) === post.permalink );
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

describe( 'PostCardHeader — author chip with getProfileUrl resolver', () => {
	function renderWithAnalytics(
		post: SocialPost,
		getProfileUrl: ( ref: { did?: string | null; handle?: string | null } ) => string | null
	) {
		const onClick = jest.fn();
		render(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick,
					getProfileUrl,
				} }
			>
				<PostCardHeader post={ post } variant="default" />
			</SocialAnalyticsProvider>
		);
		return { onClick };
	}

	const basePost: SocialPost = {
		uri: 'at://did:plc:abc/app.bsky.feed.post/xyz',
		author: {
			id: 'did:plc:abc',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: null,
			profile_url: 'https://bsky.app/profile/alice.bsky.social',
		},
		created_at: '2024-01-01T00:00:00.000Z',
		indexed_at: '2024-01-01T00:00:00.000Z',
		text: '',
		html: '',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		permalink: 'https://bsky.app/profile/alice.bsky.social/post/xyz',
	};

	it( 'uses the in-app URL when the resolver returns a string', () => {
		renderWithAnalytics( basePost, () => '/reader/atmosphere/42/profile/alice.bsky.social' );
		const link = screen.getByRole( 'link', { name: /Alice/ } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/42/profile/alice.bsky.social' );
		expect( link ).not.toHaveAttribute( 'target' );
		expect( link ).not.toHaveAttribute( 'rel' );
	} );

	it( 'fires _author_clicked with destination=in_app when in-app', async () => {
		const user = userEvent.setup();
		const { onClick } = renderWithAnalytics(
			basePost,
			() => '/reader/atmosphere/42/profile/alice.bsky.social'
		);
		await user.click( screen.getByRole( 'link', { name: /Alice/ } ) );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_author_clicked',
			expect.objectContaining( { destination: 'in_app' } )
		);
	} );

	it( 'falls back to bsky.app + new tab when the resolver returns null', () => {
		renderWithAnalytics( basePost, () => null );
		const link = screen.getByRole( 'link', { name: /Alice/ } );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/alice.bsky.social' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	it( 'fires _author_clicked with destination=bsky_app when falling back', async () => {
		const user = userEvent.setup();
		const { onClick } = renderWithAnalytics( basePost, () => null );
		await user.click( screen.getByRole( 'link', { name: /Alice/ } ) );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_author_clicked',
			expect.objectContaining( { destination: 'bsky_app' } )
		);
	} );

	describe( 'PostCardHeader — repost preface clickability', () => {
		const repostedPost: SocialPost = {
			...basePost,
			reason: {
				type: 'repost',
				by: { id: 'did:plc:joe', handle: 'joe.example.com', display_name: 'Joe' },
			},
		};

		function renderRepost(
			getProfileUrl?: ( ref: { did?: string | null; handle?: string | null } ) => string | null
		) {
			const onClick = jest.fn();
			render(
				<SocialAnalyticsProvider
					value={ {
						source: 'atmosphere',
						connectionId: 42,
						onClick,
						getProfileUrl,
					} }
				>
					<PostCardHeader post={ repostedPost } variant="default" />
				</SocialAnalyticsProvider>
			);
			return { onClick };
		}

		it( 'renders the reposter as an in-app link when the resolver returns a string', () => {
			renderRepost( () => '/reader/atmosphere/42/profile/joe.example.com' );
			const link = screen.getByRole( 'link', { name: 'Joe' } );
			expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/42/profile/joe.example.com' );
			expect( link ).not.toHaveAttribute( 'target' );
			expect( link ).not.toHaveAttribute( 'rel' );
		} );

		it( 'fires _repost_author_clicked with destination=in_app', async () => {
			const user = userEvent.setup();
			const { onClick } = renderRepost( () => '/reader/atmosphere/42/profile/joe.example.com' );
			await user.click( screen.getByRole( 'link', { name: 'Joe' } ) );
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_timeline_repost_author_clicked',
				expect.objectContaining( {
					connection_id: 42,
					reposter_did: 'did:plc:joe',
					reposter_handle: 'joe.example.com',
					destination: 'in_app',
				} )
			);
		} );

		it( 'falls back to bsky.app + new tab when the resolver returns null', () => {
			renderRepost( () => null );
			const link = screen.getByRole( 'link', { name: 'Joe' } );
			expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/joe.example.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		} );

		it( 'falls back when no resolver is provided', () => {
			renderRepost( undefined );
			const link = screen.getByRole( 'link', { name: 'Joe' } );
			expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/joe.example.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );

		it( 'fires _repost_author_clicked with destination=bsky_app when falling back', async () => {
			const user = userEvent.setup();
			const { onClick } = renderRepost( () => null );
			await user.click( screen.getByRole( 'link', { name: 'Joe' } ) );
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_timeline_repost_author_clicked',
				expect.objectContaining( { destination: 'bsky_app' } )
			);
		} );

		it( 'does not render a preface when post.reason is null', () => {
			const onClick = jest.fn();
			render(
				<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 42, onClick } }>
					<PostCardHeader post={ basePost } variant="default" />
				</SocialAnalyticsProvider>
			);
			expect( screen.queryByText( /Reposted by/i ) ).toBeNull();
		} );
	} );
} );
