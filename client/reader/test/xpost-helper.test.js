import { getXPostMetadata } from '../xpost-helper';

const xPostWithPermalink = ( value, key = '_xpost_original_permalink' ) => ( {
	tags: { 'p2-xpost': {} },
	metadata: [ { key, value } ],
} );

describe( 'getXPostMetadata', () => {
	test( 'returns null for a post that is not an x-post', () => {
		expect( getXPostMetadata( { tags: {} } ) ).toBeNull();
	} );

	test( 'reads the original site and post URLs from an https permalink', () => {
		expect(
			getXPostMetadata( xPostWithPermalink( 'https://example.wordpress.com/2024/01/01/post/' ) )
		).toEqual( {
			siteURL: 'https://example.wordpress.com',
			postURL: 'https://example.wordpress.com/2024/01/01/post/',
			commentURL: null,
			blogId: null,
			postId: null,
		} );
	} );

	test( 'accepts an http permalink', () => {
		expect( getXPostMetadata( xPostWithPermalink( 'http://example.com/post/' ) ).postURL ).toBe(
			'http://example.com/post/'
		);
	} );

	test( 'reads the comment URL from a cross-comment permalink', () => {
		const metadata = getXPostMetadata(
			xPostWithPermalink( 'https://example.com/post/#comment-12', 'xcomment_original_permalink' )
		);
		expect( metadata.postURL ).toBe( 'https://example.com/post/' );
		expect( metadata.commentURL ).toBe( 'https://example.com/post/#comment-12' );
	} );

	test( 'reads the origin blog and post IDs', () => {
		const metadata = getXPostMetadata( {
			tags: { 'p2-xpost': {} },
			metadata: [ { key: 'xpost_origin', value: '300:400' } ],
		} );
		expect( metadata.blogId ).toBe( 300 );
		expect( metadata.postId ).toBe( 400 );
	} );

	describe.each( [ '_xpost_original_permalink', 'xcomment_original_permalink' ] )(
		'with a %s that is not an http(s) URL',
		( key ) => {
			test.each( [
				'javascript://x/%0Aalert(1)',
				'javascript:alert(1)',
				'JaVaScRiPt://x/%0Aalert(1)',
				' javascript://x/%0Aalert(1)',
				'\njavascript://x/%0Aalert(1)',
				'%0Ajavascript://x/%0Aalert(1)',
				'data://x/text/html,<script>alert(1)</script>',
				'vbscript://x/%0Amsgbox(1)',
				'//example.com/post/',
				'/post/',
				'http://',
				'not a url',
				'',
			] )( 'returns no URLs for %j', ( value ) => {
				expect( getXPostMetadata( xPostWithPermalink( `${ value }#comment-1`, key ) ) ).toEqual( {
					siteURL: null,
					postURL: null,
					commentURL: null,
					blogId: null,
					postId: null,
				} );
			} );
		}
	);

	test( 'keeps a valid permalink when another permalink entry is not http(s)', () => {
		const metadata = getXPostMetadata( {
			tags: { 'p2-xpost': {} },
			metadata: [
				{ key: '_xpost_original_permalink', value: 'https://example.com/post/' },
				{ key: 'xcomment_original_permalink', value: 'javascript://x/%0Aalert(1)' },
			],
		} );
		expect( metadata.postURL ).toBe( 'https://example.com/post/' );
	} );
} );
