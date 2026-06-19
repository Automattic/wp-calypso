/**
 * @jest-environment jsdom
 */
import { getPostFields } from '../post-fields';
import type { ReadStreamPost } from '@automattic/api-core';

describe( 'getPostFields', () => {
	it( 'links an external feed post to its reader feed-post page', () => {
		const post = {
			ID: 5,
			feed_ID: 10,
			feed_item_ID: 99,
			is_external: true,
			title: 'Hello',
			site_name: 'Example Blog',
			is_seen: false,
		} as unknown as ReadStreamPost;

		const fields = getPostFields( post );

		expect( fields.postHref ).toBe( '/reader/feeds/10/posts/99' );
		expect( fields.title ).toBe( 'Hello' );
		expect( fields.sourceName ).toBe( 'Example Blog' );
		expect( fields.isUnread ).toBe( true );
	} );

	it( 'links a blog post to its reader blog-post page', () => {
		const post = {
			ID: 7,
			site_ID: 20,
			title: 'A post',
			site_name: 'Site',
		} as unknown as ReadStreamPost;

		expect( getPostFields( post ).postHref ).toBe( '/reader/blogs/20/posts/7' );
	} );

	it( 'keys posts by the Reader compound identity, not just post id', () => {
		const first = {
			ID: 7,
			site_ID: 20,
			title: 'First',
		} as unknown as ReadStreamPost;
		const second = {
			ID: 7,
			site_ID: 21,
			title: 'Second',
		} as unknown as ReadStreamPost;

		expect( getPostFields( first ).key ).toBe( 'blog-7-20' );
		expect( getPostFields( second ).key ).toBe( 'blog-7-21' );
	} );

	it( 'reads the image from canonical_media and the author name', () => {
		const post = {
			ID: 1,
			site_ID: 2,
			canonical_media: { src: 'https://example.com/a.jpg', mediaType: 'image' },
			author: { name: 'Ada' },
		} as unknown as ReadStreamPost;

		const fields = getPostFields( post );

		expect( fields.imageUrl ).toBe( 'https://example.com/a.jpg' );
		expect( fields.authorName ).toBe( 'Ada' );
	} );

	it( 'returns sanitized excerpt HTML whose text decodes entities', () => {
		const post = {
			ID: 1,
			site_ID: 2,
			excerpt: '<p>Latin, Asian Pop and R&amp;B genres, including the Best&hellip;</p>',
		} as unknown as ReadStreamPost;

		const { excerptHtml } = getPostFields( post );
		// Renders as HTML (not escaped), so the displayed text decodes entities.
		const host = document.createElement( 'div' );
		host.innerHTML = excerptHtml;
		expect( host.textContent ).toBe( 'Latin, Asian Pop and R&B genres, including the Best…' );
	} );

	it( 'decodes HTML entities in the plain-text title, source and author', () => {
		const post = {
			ID: 1,
			site_ID: 2,
			title: 'Pre-Order Reveal&nbsp;: GTA&nbsp;6',
			site_name: 'Kendall Lacey&#039;s Webworld',
			author: { name: 'A &amp; B' },
		} as unknown as ReadStreamPost;

		const fields = getPostFields( post );
		expect( fields.title ).toBe( 'Pre-Order Reveal : GTA 6' );
		expect( fields.sourceName ).toBe( "Kendall Lacey's Webworld" );
		expect( fields.authorName ).toBe( 'A & B' );
	} );

	it( 'reads the blog icon from site_icon.ico', () => {
		const post = {
			ID: 1,
			site_ID: 2,
			site_icon: { ico: 'https://example.com/blavatar.ico' },
		} as unknown as ReadStreamPost;

		expect( getPostFields( post ).siteIconUrl ).toBe( 'https://example.com/blavatar.ico' );
	} );
} );
