/** @format */
/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { fetch, fromApi, onError, onSuccess } from '../';
import { like, updateLikeCount } from 'state/posts/likes/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				success: true,
				like_count: 45,
			} )
		).toEqual( {
			success: true,
			likeCount: 45,
		} );

		expect(
			fromApi( {
				// just in case
				success: 1,
				like_count: '45',
			} )
		).toEqual( {
			success: true,
			likeCount: 45,
		} );
	} );
} );

describe( 'fetch', () => {
	it( 'should return an http action', () => {
		const action = fetch( { siteId: 1, postId: 1 } );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty( 'path', '/sites/1/posts/1/likes/mine/delete' );
		expect( action ).toHaveProperty( 'query.apiVersion', '1.1' );
	} );
} );

describe( 'onSuccess', () => {
	it( 'should generate an updateLikeCount action', () => {
		expect( onSuccess( { siteId: 1, postId: 1 }, { likeCount: 25 } ) ).toEqual(
			updateLikeCount( 1, 1, 25 )
		);
	} );
} );

describe( 'onError', () => {
	it( 'should generate a like that bypasses the data layer', () => {
		expect( onError( { siteId: 1, postId: 1 } ) ).toEqual( bypassDataLayer( like( 1, 1 ) ) );
	} );
} );
