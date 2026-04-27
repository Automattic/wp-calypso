/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardLink } from '../post-card-link';

const post = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	cid: 'cid1',
	bluesky_url: 'https://bsky.app/profile/a.bsky.social/post/x',
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
	author: { did: 'did:plc:abc', handle: 'a.bsky.social', display_name: 'A', avatar: null },
} as const;

describe( 'PostCardLink', () => {
	it( 'renders a single anchor pointing at bluesky_url with target=_blank rel=noopener noreferrer', () => {
		render(
			<PostCardLink post={ post } variant="default" timestampLabel="2h ago">
				<div>body</div>
			</PostCardLink>
		);
		const link = screen.getByRole( 'link', { name: /2h ago/i } );
		expect( link ).toHaveAttribute( 'href', post.bluesky_url );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	it( 'renders the View on Bluesky cue', () => {
		render(
			<PostCardLink post={ post } variant="default" timestampLabel="2h ago">
				<div>body</div>
			</PostCardLink>
		);
		expect( screen.getByText( '↗' ) ).toBeVisible();
	} );

	it( 'renders the children inside the wrapper', () => {
		render(
			<PostCardLink post={ post } variant="default" timestampLabel="2h ago">
				<div>body content</div>
			</PostCardLink>
		);
		expect( screen.getByText( 'body content' ) ).toBeVisible();
	} );
} );
