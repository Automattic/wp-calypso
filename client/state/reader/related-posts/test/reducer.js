/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { items, queuedRequests } from '../reducer';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE
} from 'state/action-types';

describe( 'items', () => {
	it( 'should store the posts by global_ID', () => {
		expect( items( {}, {
			type: READER_RELATED_POSTS_RECEIVE,
			payload: {
				siteId: 1,
				postId: 1,
				posts: [
					{ global_ID: 2 },
					{ global_ID: 3 },
					{ global_ID: 4 }
				]
			}
		} ) ).to.deep.equal( {
			'1-1': [ 2, 3, 4 ]
		} );
	} );

	it( 'should overwrite existing posts', () => {
		expect( items( {
			'1-1': [ 2, 3, 4 ]
		}, {
			type: READER_RELATED_POSTS_RECEIVE,
			payload: {
				siteId: 1,
				postId: 1,
				posts: [
					{ global_ID: 3 },
					{ global_ID: 4 },
					{ global_ID: 9 }
				]
			}
		} ) ).to.deep.equal( {
			'1-1': [ 3, 4, 9 ]
		} );
	} );
} );

describe( 'queuedRequests', () => {
	it( 'request should set the flag', () => {
		expect( queuedRequests( {}, {
			type: READER_RELATED_POSTS_REQUEST,
			payload: {
				siteId: 1,
				postId: 1
			}
		} ) ).to.deep.equal( {
			'1-1': true
		} );
	} );

	it( 'request success should unset the flag', () => {
		expect( queuedRequests( {
			'1-1': true
		}, {
			type: READER_RELATED_POSTS_REQUEST_SUCCESS,
			payload: {
				siteId: 1,
				postId: 1
			}
		} ) ).to.deep.equal( {
			'1-1': false
		} );
	} );

	it( 'request should set the flag', () => {
		expect( queuedRequests( {}, {
			type: READER_RELATED_POSTS_REQUEST_FAILURE,
			payload: {
				siteId: 1,
				postId: 1
			}
		} ) ).to.deep.equal( {
			'1-1': false
		} );
	} );
} );
