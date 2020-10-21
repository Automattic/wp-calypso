/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { fetch, fromApi, onError, onSuccess } from '../';
import { like, removeLiker } from 'calypso/state/posts/likes/actions';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';

const LIKER = Object.freeze( {} );

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				success: true,
				like_count: 45,
				liker: LIKER,
			} )
		).toEqual( {
			likeCount: 45,
			liker: LIKER,
		} );

		expect(
			fromApi( {
				// just in case
				success: 1,
				like_count: '45',
			} )
		).toEqual( {
			likeCount: 45,
		} );
	} );

	test( 'should throw an error when success is false', () => {
		expect( () => fromApi( { success: false } ) ).toThrow( 'Unsuccessful unlike API request' );
	} );
} );

describe( 'fetch', () => {
	test( 'should return an http action', () => {
		const action = fetch( { siteId: 1, postId: 1 } );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty( 'path', '/sites/1/posts/1/likes/mine/delete' );
		expect( action ).toHaveProperty( 'query.apiVersion', '1.1' );
	} );
} );

describe( 'onSuccess', () => {
	test( 'should generate a removeLiker action', () => {
		expect( onSuccess( { siteId: 1, postId: 1 }, { likeCount: 25, liker: LIKER } ) ).toEqual(
			removeLiker( 1, 1, 25, LIKER )
		);
	} );
} );

describe( 'onError', () => {
	test( 'should generate a like that bypasses the data layer', () => {
		expect( onError( { siteId: 1, postId: 1 } ) ).toEqual( bypassDataLayer( like( 1, 1 ) ) );
	} );
} );
