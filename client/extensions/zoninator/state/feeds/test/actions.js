/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_SAVE_FEED,
	ZONINATOR_UPDATE_FEED,
} from '../../action-types';
import { requestFeed, requestFeedError, saveFeed, updateFeed } from '../actions';

describe( 'actions', () => {
	const siteId = 1234;
	const zoneId = 5678;

	const posts = [
		{ ID: 1, title: 'A test post' },
		{ ID: 2, title: 'Another test post' },
	];

	describe( 'requestFeed()', () => {
		test( 'should return an action object', () => {
			const action = requestFeed( siteId, zoneId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_FEED,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'requestFeedError()', () => {
		it( 'should return an action object', () => {
			const action = requestFeedError( siteId, zoneId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_FEED_ERROR,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'saveFeed()', () => {
		test( 'should return an action object', () => {
			const action = saveFeed( siteId, zoneId, posts );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_SAVE_FEED,
				posts,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'updateFeed()', () => {
		test( 'should return an action object', () => {
			const action = updateFeed( siteId, zoneId, posts );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_FEED,
				posts,
				siteId,
				zoneId,
			} );
		} );
	} );
} );
