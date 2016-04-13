import { expect } from 'chai';
import { spy } from 'sinon';

import {
	withAnalytics,
	bumpStat
} from '../actions.js';

describe( 'middleware', () => {
	describe( 'actions', () => {
		it( 'should wrap an existing action', () => {
			const testAction = { type: 'RETICULATE_SPLINES' };
			const statBump = bumpStat( 'splines', 'reticulated_count' );
			const expected = Object.assign( {}, testAction, { meta: statBump.meta } );

			expect( withAnalytics( statBump, testAction ) )
				.to
				.deep
				.equal( expected );
		} );

		it( 'should trigger analytics and run passed thunks', () => {
			const dispatch = spy();
			const testAction = dispatch => dispatch( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( dispatch );
			expect( dispatch ).to.have.been.calledTwice;
		} );
	} );
} );
