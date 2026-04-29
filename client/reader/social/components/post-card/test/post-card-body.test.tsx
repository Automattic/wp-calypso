/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { PostCardBody } from '../post-card-body';
import type { SocialPost } from '../../../types';

function baseHtml( html: string ): SocialPost {
	return {
		uri: 'at://x',
		author: {
			id: 'd',
			handle: 'h.bsky.social',
			display_name: '',
			avatar: null,
			profile_url: 'https://bsky.app/profile/h.bsky.social',
		},
		created_at: '',
		indexed_at: '',
		text: 'hello',
		html,
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		permalink: '',
	};
}

describe( 'PostCardBody', () => {
	it( 'renders the sanitised html via DOMPurify', () => {
		const { container } = render(
			<PostCardBody post={ baseHtml( '<p>hello <strong>x</strong></p>' ) } />
		);
		// strong is stripped by the sanitiser allow-list (only p / br / a allowed)
		expect( container.querySelector( 'p' ) ).not.toBeNull();
		expect( container.querySelector( 'strong' ) ).toBeNull();
	} );

	it( 'falls back to raw text when html is empty', () => {
		const { getByText } = render( <PostCardBody post={ baseHtml( '' ) } /> );
		expect( getByText( 'hello' ) ).toBeVisible();
	} );
} );
