/**
 * External dependencies
 */
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_START_RECOMMENDATIONS_RECEIVE
} from 'state/action-types';

import {
	receiveRecommendations
} from '../actions';

describe( 'actions', () => {
	useNock();

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveRecommendations()', () => {
		it( 'should return an action object', () => {
			const recommendations = {};
			const action = receiveRecommendations( recommendations );

			expect( action ).to.eql( {
				type: READER_START_RECOMMENDATIONS_RECEIVE,
				recommendations
			} );
		} );
	} );
} );
