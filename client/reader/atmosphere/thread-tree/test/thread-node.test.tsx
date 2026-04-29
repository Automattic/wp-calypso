/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadNode } from '../thread-node';
import type { AtmosphereThreadNode, AtmosphereFeedItem } from '@automattic/api-core';

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
		text: 'hi',
		html: '<p>hi</p>',
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

describe( 'ThreadNode', () => {
	it( 'marks the highlighted node with aria-current="location"', () => {
		const node: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem(),
			parent: null,
			replies: [],
		};
		render( <ThreadNode node={ node } depth={ 0 } highlighted /> );
		const article = screen.getByRole( 'article' );
		expect( article ).toHaveAttribute( 'aria-current', 'location' );
		expect( article.classList.contains( 'is-target' ) ).toBe( true );
	} );

	it( 'does not mark non-highlighted nodes', () => {
		const node: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem(),
			parent: null,
			replies: [],
		};
		render( <ThreadNode node={ node } depth={ 0 } highlighted={ false } /> );
		expect( screen.getByRole( 'article' ) ).not.toHaveAttribute( 'aria-current' );
	} );

	it( 'recursively renders nested replies with depth + 1', () => {
		const node: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://parent', text: 'parent' } ),
			parent: null,
			replies: [
				{
					type: 'post',
					post: makeFeedItem( { uri: 'at://child', text: 'child' } ),
					parent: null,
					replies: [],
				},
			],
		};
		render( <ThreadNode node={ node } depth={ 0 } highlighted /> );
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 2 );
		expect(
			screen.getAllByRole( 'article' )[ 1 ].classList.contains( 'thread-node--depth-1' )
		).toBe( true );
	} );

	it( 'caps the indentation class for any depth greater than 4', () => {
		const node: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://deep', text: 'deep' } ),
			parent: null,
			replies: [],
		};
		// Depths 0–4 stay uncapped.
		for ( const depth of [ 0, 4 ] ) {
			const { container, unmount } = render(
				<ThreadNode node={ node } depth={ depth } highlighted={ false } />
			);
			const article = container.querySelector( '[role="article"]' )!;
			expect( article.classList.contains( 'thread-node--capped' ) ).toBe( false );
			expect( ( article as HTMLElement ).style.getPropertyValue( '--thread-depth' ) ).toBe(
				String( depth )
			);
			unmount();
		}
		// Depths 5, 6, 7, 12 all share the same capped indentation.
		for ( const depth of [ 5, 6, 7, 12 ] ) {
			const { container, unmount } = render(
				<ThreadNode node={ node } depth={ depth } highlighted={ false } />
			);
			const article = container.querySelector( '[role="article"]' )!;
			expect( article.classList.contains( 'thread-node--capped' ) ).toBe( true );
			expect( ( article as HTMLElement ).style.getPropertyValue( '--thread-depth' ) ).toBe( '4' );
			unmount();
		}
	} );

	it( 'omits replies when renderReplies is false', () => {
		const node: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://parent', text: 'parent' } ),
			parent: null,
			replies: [
				{
					type: 'post',
					post: makeFeedItem( { uri: 'at://child', text: 'child reply' } ),
					parent: null,
					replies: [],
				},
			],
		};
		render(
			<ThreadNode node={ node } depth={ 0 } highlighted={ false } renderReplies={ false } />
		);
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 1 );
		expect( screen.queryByText( 'child reply' ) ).toBeNull();
	} );

	it( 'renders a not_found tombstone for not_found nodes', () => {
		const node: AtmosphereThreadNode = { type: 'not_found', uri: 'at://gone' };
		render( <ThreadNode node={ node } depth={ 1 } highlighted={ false } /> );
		expect( screen.getByRole( 'note' ) ).toHaveTextContent( 'Post unavailable' );
		expect( screen.queryByRole( 'article' ) ).toBeNull();
	} );

	it( 'renders a blocked tombstone for blocked nodes', () => {
		const node: AtmosphereThreadNode = {
			type: 'blocked',
			uri: 'at://blocked',
			author: { did: 'did:plc:blk' },
		};
		render( <ThreadNode node={ node } depth={ 1 } highlighted={ false } /> );
		expect( screen.getByRole( 'note' ) ).toHaveTextContent( 'Post is from a blocked author' );
	} );
} );
