/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_SAVE_FEED,
	ZONINATOR_UPDATE_FEED,
} from '../../action-types';
import { requestFeed, saveFeed, updateFeed } from '../actions';

describe( 'actions', () => {
	const siteId = 1234;
	const zoneId = 5678;

	const posts = [ { ID: 1, title: 'A test post' }, { ID: 2, title: 'Another test post' } ];

	describe( 'requestFeed()', () => {
		it( 'should return an action object', () => {
			const action = requestFeed( siteId, zoneId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_FEED,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'saveFeed()', () => {
		it( 'should return an action object', () => {
			const action = saveFeed( siteId, zoneId, 'test-form', posts );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_SAVE_FEED,
				form: 'test-form',
				posts,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'updateFeed()', () => {
		it( 'should return an action object', () => {
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
