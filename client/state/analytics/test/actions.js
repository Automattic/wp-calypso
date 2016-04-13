import flowRight from 'lodash/flowRight';
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
			const expected = Object.assign( statBump, testAction );
			const composite = withAnalytics( statBump, testAction );

			expect( composite ).to.deep.equal( expected );
		} );

		it( 'should trigger analytics and run passed thunks', () => {
			const dispatch = spy();
			const testAction = dispatcher => dispatcher( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( dispatch );
			expect( dispatch ).to.have.been.calledTwice;
		} );

		it( 'should compose multiple analytics calls', () => {
			const composite = withAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);

			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
		} );

		it( 'should compose multiple analytics calls with normal actions', () => {
			const composite = flowRight(
				withAnalytics( bumpStat( 'spline_types', 'ocean' ) ),
				withAnalytics( bumpStat( 'spline_types', 'river' ) ),
				() => ( { type: 'RETICULATE_SPLINES' } )
			)();

			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
		} );
	} );
} );
