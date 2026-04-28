/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadHeader } from '../thread-header';
import type { AtmosphereConnection, AtmosphereFeedItem } from '@automattic/api-core';

function makeFeedItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:abc/app.bsky.feed.post/3k',
		cid: 'c',
		author: {
			did: 'did:plc:abc',
			handle: 'jane.bsky.social',
			display_name: 'Jane',
			avatar: null,
		},
		created_at: '',
		indexed_at: '',
		text: '',
		html: '<p></p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: '',
		...overrides,
	};
}

const connection: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

describe( 'ThreadHeader', () => {
	it( 'renders the target author name + handle when target post is set', () => {
		render(
			<ThreadHeader
				connection={ connection }
				targetPost={ makeFeedItem( {
					author: {
						did: 'did:plc:abc',
						handle: 'jane.bsky.social',
						display_name: 'Jane Doe',
						avatar: null,
					},
				} ) }
			/>
		);
		expect( screen.getByText( /Jane Doe/i ) ).toBeVisible();
		expect( screen.getByText( /@jane\.bsky\.social/i ) ).toBeVisible();
	} );

	it( 'renders the back-to-timeline link with the correct href', () => {
		render( <ThreadHeader connection={ connection } targetPost={ null } /> );
		const back = screen.getByRole( 'link', { name: /back to timeline/i } );
		expect( back ).toHaveAttribute( 'href', '/reader/atmosphere/7/timeline' );
	} );

	it( 'falls back to a generic Thread title when target post is null', () => {
		render( <ThreadHeader connection={ connection } targetPost={ null } /> );
		expect( screen.getByText( /Thread/i ) ).toBeVisible();
	} );
} );
