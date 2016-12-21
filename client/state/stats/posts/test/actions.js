/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
} from 'state/action-types';
import {
	receivePostStat,
	requestPostStat
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( 'receivePostStat()', () => {
		it( 'should return an action object', () => {
			const action = receivePostStat( 'views', 2916284, 2454, 2 );

			expect( action ).to.eql( {
				type: POST_STATS_RECEIVE,
				stat: 'views',
				siteId: 2916284,
				postId: 2454,
				value: 2
			} );
		} );
	} );

	describe( 'requestPostStat()', () => {
		it( 'should return an action object', () => {
			const action = requestPostStat( 'views', 2916284, 2454, 2 );

			expect( action ).to.eql( {
				type: POST_STATS_REQUEST,
				stat: 'views',
				siteId: 2916284,
				postId: 2454
			} );
		} );
	} );
} );
