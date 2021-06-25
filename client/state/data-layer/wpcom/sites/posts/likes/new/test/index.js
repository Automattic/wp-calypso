/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { fetch, fromApi, onSuccess, onError } from '../';
import { unlike, addLiker } from 'calypso/state/posts/likes/actions';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				success: true,
				like_count: 45,
			} )
		).toEqual( {
			likeCount: 45,
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

	test( 'throws an error when success is falsey', () => {
		expect( () =>
			fromApi( {
				success: false,
				like_count: 100,
			} )
		).toThrow( 'Unsuccessful like API call' );
	} );
} );

describe( 'fetch', () => {
	test( 'should return an http action', () => {
		const action = fetch( { siteId: 1, postId: 1 } );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty( 'path', '/sites/1/posts/1/likes/new' );
		expect( action ).toHaveProperty( 'query.apiVersion', '1.1' );
	} );
} );

describe( 'onSuccess', () => {
	test( 'should generate an addLiker action', () => {
		expect( onSuccess( { siteId: 1, postId: 1 }, { likeCount: 25, liker: {} } ) ).toEqual(
			addLiker( 1, 1, 25, {} )
		);
	} );
} );

describe( 'onError', () => {
	it( 'should generate a like that bypasses the data layer', () => {
		expect( onError( { siteId: 1, postId: 1 } ) ).toEqual( bypassDataLayer( unlike( 1, 1 ) ) );
	} );
} );
