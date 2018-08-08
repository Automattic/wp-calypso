/** @format */

/**
 * Internal dependencies
 */
import getReaderSiteIdFromHostname from 'state/selectors/get-reader-site-id-from-hostname';

const prevState = {
	reader: {
		posts: {
			items: {
				xyz: {
					URL: 'http://blog.example.com/posts/12345',
					site_ID: 999,
				},
			},
		},
	},
};

describe( 'getReaderSiteIdFromHostname()', () => {
	test( 'should return null for an unknown hostname', () => {
		const nextState = getReaderSiteIdFromHostname( prevState, 'raspberry.com' );
		expect( nextState ).toEqual( null );
	} );

	test( 'should return a blog ID for a known hostname', () => {
		const nextState = getReaderSiteIdFromHostname( prevState, 'blog.example.com' );
		expect( nextState ).toEqual( 999 );
	} );
} );
