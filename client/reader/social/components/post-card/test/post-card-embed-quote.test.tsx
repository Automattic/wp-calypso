/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardEmbedQuote } from '../post-card-embed-quote';
import type { SocialEmbedQuote, SocialPost } from '../../../types';

const innerPost: SocialPost = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/inner',
	author: {
		id: 'did:plc:abc',
		handle: 'inner.bsky.social',
		display_name: 'Inner',
		avatar: null,
		profile_url: 'https://bsky.app/profile/inner.bsky.social',
	},
	created_at: '2026-04-27T09:00:00Z',
	indexed_at: '2026-04-27T09:00:00Z',
	text: 'inner text',
	html: '<p>inner text</p>',
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	permalink: 'https://bsky.app/profile/inner.bsky.social/post/inner',
};

describe( 'PostCardEmbedQuote', () => {
	it( 'renders a tombstone for a not_found quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ {
					type: 'quote',
					post: { type: 'not_found', uri: 'at://x' },
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /unavailable/i ) ).toBeVisible();
	} );

	it( 'renders a tombstone for a blocked quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ {
					type: 'quote',
					post: { type: 'blocked', uri: 'at://y' },
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /blocked author/i ) ).toBeVisible();
	} );

	it( 'renders the inner post for a live quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ { type: 'quote', post: innerPost } }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'inner text' ) ).toBeVisible();
		expect( screen.getByText( '@inner.bsky.social' ) ).toBeVisible();
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

describe( 'PostCardEmbedQuote getThreadUrl rewiring', () => {
	const quotedPost: SocialPost = makeSocialPost( {
		uri: 'at://did:plc:def/app.bsky.feed.post/3kdef',
		permalink: 'https://bsky.app/profile/jane.bsky.social/post/3kdef',
	} );
	const embed: SocialEmbedQuote = { type: 'quote', post: quotedPost };

	function wrap(
		ui: React.ReactNode,
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
				{ ui }
			</SocialAnalyticsProvider>
		);
	}

	it( 'routes in-app when resolver returns a string for the quoted post', () => {
		const getThreadUrl = ( uri: string ) =>
			uri === quotedPost.uri ? '/reader/atmosphere/7/thread/did:plc:def/3kdef' : null;
		render(
			wrap( <PostCardEmbedQuote embed={ embed } parentPostUri="at://parent" />, getThreadUrl )
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/7/thread/did:plc:def/3kdef' );
		expect( link ).not.toHaveAttribute( 'target' );
	} );

	it( 'falls back to the permalink when resolver returns null', () => {
		render(
			wrap( <PostCardEmbedQuote embed={ embed } parentPostUri="at://parent" />, () => null )
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', quotedPost.permalink );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'fires quote_clicked with destination discriminator', async () => {
		const onClick = jest.fn();
		const getThreadUrl = ( uri: string ) =>
			uri === quotedPost.uri ? '/reader/atmosphere/7/thread/did:plc:def/3kdef' : null;
		render(
			wrap(
				<PostCardEmbedQuote embed={ embed } parentPostUri="at://parent" />,
				getThreadUrl,
				onClick
			)
		);
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'link' ) );
		expect( onClick ).toHaveBeenCalledWith(
			expect.stringContaining( '_quote_clicked' ),
			expect.objectContaining( {
				connection_id: 7,
				parent_uri: 'at://parent',
				quoted_uri: quotedPost.uri,
				destination: 'in_app_thread',
			} )
		);
	} );
} );
