/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { fetch, fromApi, onSuccess } from '../';
import { POST_LIKES_REQUEST } from 'calypso/state//action-types';
import { receiveLikes } from 'calypso/state/posts/likes/actions';

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				found: 45,
				likes: [],
			} )
		).toEqual( {
			found: 45,
			likes: [],
			iLike: false,
		} );

		expect(
			fromApi( {
				found: '45',
				likes: [],
				i_like: true,
			} )
		).toEqual( {
			found: 45,
			likes: [],
			iLike: true,
		} );
	} );
} );

describe( 'fetch', () => {
	it( 'should return an http action with the proper path', () => {
		const action = fetch( {
			type: POST_LIKES_REQUEST,
			siteId: 1,
			postId: 1,
		} );
		expect( action ).toHaveProperty( 'method', 'GET' );
		expect( action ).toHaveProperty( 'path', '/sites/1/posts/1/likes' );
		expect( action ).toHaveProperty( 'query.apiVersion', '1.1' );
	} );
} );

describe( 'onSuccess', () => {
	it( 'should return a receiveLikes action with the data', () => {
		const data = {};
		expect( onSuccess( { siteId: 1, postId: 1 }, data ) ).toEqual( receiveLikes( 1, 1, data ) );
	} );
} );
