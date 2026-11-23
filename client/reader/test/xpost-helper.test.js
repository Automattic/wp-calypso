import { getXPostMetadata } from '../xpost-helper';

const xPostWithMetadata = ( metadata ) => ( { tags: { 'p2-xpost': {} }, metadata } );

describe( 'getXPostMetadata', () => {
	test( 'reads the original site, post and comment URLs from an https permalink', () => {
		const metadata = getXPostMetadata(
			xPostWithMetadata( [
				{ key: 'xcomment_original_permalink', value: 'https://example.com/post/#comment-12' },
			] )
		);
		expect( metadata.siteURL ).toBe( 'https://example.com' );
		expect( metadata.postURL ).toBe( 'https://example.com/post/' );
		expect( metadata.commentURL ).toBe( 'https://example.com/post/#comment-12' );
	} );

	// The permalinks are post meta set by the x-post's site, and the Reader opens them.
	test.each( [
		[ '_xpost_original_permalink', 'javascript://x/%0Aalert(1)' ],
		[ '_xpost_original_permalink', '\nJaVaScRiPt://x/%0Aalert(1)' ],
		[ '_xpost_original_permalink', 'data://x/text/html,hi' ],
		[ 'xcomment_original_permalink', 'javascript://x/%0Aalert(1)#comment-1' ],
		[ 'xcomment_original_permalink', '//example.com/post/#comment-1' ],
	] )( 'returns no URLs for a %s of %j', ( key, value ) => {
		const metadata = getXPostMetadata( xPostWithMetadata( [ { key, value } ] ) );
		expect( metadata.siteURL ).toBeNull();
		expect( metadata.postURL ).toBeNull();
		expect( metadata.commentURL ).toBeNull();
	} );

	test( 'keeps a valid permalink when another permalink entry is rejected', () => {
		const metadata = getXPostMetadata(
			xPostWithMetadata( [
				{ key: '_xpost_original_permalink', value: 'https://example.com/post/' },
				{ key: 'xcomment_original_permalink', value: 'javascript://x/%0Aalert(1)' },
			] )
		);
		expect( metadata.postURL ).toBe( 'https://example.com/post/' );
	} );
} );
